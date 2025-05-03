import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth/auth';

// File validation schema
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size should be less than 10MB',
    })
    .refine((file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), {
      message: 'File type should be JPEG, PNG or PDF',
    }),
});

// Verify bucket exists and is accessible, create if it doesn't exist
async function verifyBucket(supabase: any, bucketName: string) {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return { success: false, error };
    }
    
    const bucketExists = buckets.some((bucket: { name: string }) => bucket.name === bucketName);
    
    // Just report status, don't try to create the bucket
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' not found.`);
      console.log('Available buckets:', buckets.map((b: { name: string }) => b.name).join(', '));
      return { 
        success: false, 
        error: new Error(`Bucket '${bucketName}' does not exist and creation requires admin privileges`) 
      };
    }
    
    // Bucket exists
    console.log(`Bucket '${bucketName}' exists`);
    
    // Check if we can access the bucket
    const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket(bucketName);
    
    if (bucketError) {
      console.error(`Error accessing bucket '${bucketName}':`, bucketError);
      return { 
        success: false, 
        error: new Error(`Cannot access bucket '${bucketName}': ${bucketError.message}`) 
      };
    }
    
    // Success, bucket exists and is accessible
    return { success: true, error: null, bucketInfo };
  } catch (err) {
    console.error('Error verifying bucket:', err);
    return { success: false, error: err };
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename and prepare file for upload
    const filename = (formData.get('file') as File).name;
    const buffer = await file.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    // Initialize Supabase client
    const supabase = createClient();
    
    console.log('Debug - Auth Session:', session);
    console.log('Debug - User ID (raw):', session.user?.id);
    console.log('Debug - User ID type:', typeof session.user?.id);
    
    // List all available buckets before trying to verify
    const { data: allBuckets, error: bucketListError } = await supabase.storage.listBuckets();
    
    console.log('Debug - All available buckets:', allBuckets);
    console.log('Debug - Bucket list error:', bucketListError);
    
    // Check if our target bucket exists in the list
    const targetBucketExists = allBuckets?.some((bucket: { name: string }) => 
      bucket.name === 'temp-uploads'
    );
    
    console.log('Debug - Target bucket "temp-uploads" exists:', targetBucketExists);
    
    // Fall back to our original verification method
    const bucketCheck = await verifyBucket(supabase, 'temp-uploads');
    
    if (!bucketCheck.success) {
      console.error('Bucket verification failed:', bucketCheck.error);
      return NextResponse.json({ 
        error: `Storage setup needed: ${bucketCheck.error?.message || 'Unknown error'}`, 
        setupRequired: true,
        message: "Please go to your Supabase dashboard and create a bucket named 'temp-uploads' with appropriate permissions."
      }, { status: 500 });
    }
    
    // Create a unique file path including user ID to prevent name collisions
    const userId = session.user?.id || 'anonymous';
    
    // Important: For Supabase RLS policies with storage.foldername(name)[1], 
    // we must ensure the userId is the first folder segment in the path
    const filePath = `${userId}/${Date.now()}_${filename}`;
    
    console.log('Debug - Upload attempt:', { 
      bucket: 'temp-uploads', 
      userId, 
      filePath,
      contentType: file.type
    });
    
    // Try to create user folder if it doesn't exist
    try {
      // First check if the folder exists by listing its contents
      const { data: folderCheck, error: folderCheckError } = await supabase.storage
        .from('temp-uploads')
        .list(userId, { limit: 1 });
        
      // If we got a permission error or other problem, try to create the directory
      if (folderCheckError || !folderCheck) {
        console.log(`Creating user directory for ${userId}...`);
        
        // Create an empty placeholder file to establish the folder structure
        const placeholderPath = `${userId}/.folder`;
        const placeholderData = new Uint8Array([]);
        
        const { error: placeholderError } = await supabase.storage
          .from('temp-uploads')
          .upload(placeholderPath, placeholderData, {
            contentType: 'text/plain',
            upsert: true
          });
          
        if (placeholderError) {
          console.error('Error creating user folder:', placeholderError);
          // Continue anyway as the upload might still work
        } else {
          console.log(`Successfully created folder for user ${userId}`);
        }
      }
    } catch (err) {
      console.error('Error checking/creating user folder:', err);
      // Continue with the upload regardless
    }
    
    // Test bucket access by listing contents
    const { data: listData, error: listError } = await supabase.storage
      .from('temp-uploads')
      .list(userId, {
        limit: 1,
        offset: 0,
      });
      
    console.log('Debug - Bucket list test:', { 
      success: !listError, 
      error: listError, 
      items: listData?.length || 0 
    });
    
    // Upload file to Supabase Storage - using temp-uploads bucket
    const { data, error } = await supabase.storage
      .from('temp-uploads')
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // More specific error handling based on error type
      if (error.message.includes('bucket') || error.message.includes('404')) {
        return NextResponse.json({ 
          error: `Storage bucket not found: ${error.message}` 
        }, { status: 500 });
      }
      
      if (error.message.includes('permission') || error.message.includes('403')) {
        return NextResponse.json({ 
          error: `Permission denied: ${error.message}. Path: ${filePath}` 
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: `Upload error: ${error.message}. Path: ${filePath}` 
      }, { status: 500 });
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('temp-uploads')
      .getPublicUrl(filePath);

    // Return the file details for use in the application
    return NextResponse.json({
      url: urlData.publicUrl,
      pathname: filename,
      contentType: file.type
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
