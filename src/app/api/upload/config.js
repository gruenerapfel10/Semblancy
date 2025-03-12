// app/api/upload/route.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Define allowed file types (add this before the POST function)
const allowedTypes = [
  'text/csv', 
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export async function POST(req) {
  const { fileName, contentType, projectName, userId } = await req.json();
  
  // Validation
  if (!allowedTypes.includes(contentType)) {
    return Response.json({ error: 'File type not allowed' }, { status: 400 });
  }
  
  // Create S3 client (server-side only)
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  
  const normalizedProjectName = projectName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const key = `users/${userId}/projects/${normalizedProjectName}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType
  });
  
  // Generate pre-signed URL with short expiration
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  
  return Response.json({ 
    uploadUrl: presignedUrl,
    key: key
  });
}