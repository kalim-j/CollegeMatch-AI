import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, // Note: Need a secret key for server-side upload if not using unsigned
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<Response>((resolve) => {
      cloudinary.uploader.upload_stream({
        upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      }, (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          resolve(NextResponse.json({ error: "Upload failed" }, { status: 500 }));
        } else {
          resolve(NextResponse.json({ url: result?.secure_url }));
        }
      }).end(buffer);
    });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
