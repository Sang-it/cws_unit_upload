import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import { Open } from "unzipper"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
        }

        // Check if file is a ZIP
        if (!file.name.endsWith(".zip")) {
            return NextResponse.json({ success: false, message: "Only ZIP files are allowed" }, { status: 400 })
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "../")
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Create a unique filename
        const timestamp = new Date().getTime()
        const filename = `${timestamp}-${file.name}`
        const filepath = join(uploadsDir, filename).slice(0, -4)

        // Convert file to buffer and save it
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const directory = await Open.buffer(buffer);
        await directory.extract({ path: filepath })

        return NextResponse.json({ success: true, filename })
    } catch (error) {
        console.error("Error uploading file:", error)
        return NextResponse.json({ success: false, message: "Failed to upload file" }, { status: 500 })
    }
}

// Increase the limit for the request body size
export const config = {
    api: {
        bodyParser: {
            sizeLimit: "10mb",
        },
    },
}
