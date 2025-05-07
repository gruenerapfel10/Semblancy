"use client";
import { useState, useEffect } from "react";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PdfViewerProps {
  fileUrl?: string;
  file?: File;
}

export default function PdfViewer({ fileUrl, file }: PdfViewerProps) {
  const [url, setUrl] = useState<string | undefined>(fileUrl);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    // If a File object is provided, create a URL for it
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setUrl(objectUrl);
      
      // Clean up the URL when component unmounts
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (fileUrl) {
      setUrl(fileUrl);
    }
  }, [file, fileUrl]);

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <p className="text-muted-foreground">No PDF selected</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          plugins={[defaultLayoutPluginInstance]}
        />
      </Worker>
    </div>
  );
} 