import { type NextRequest, NextResponse } from "next/server"
import { Open } from "unzipper"
import { execSync } from "node:child_process"

export async function POST(request: NextRequest) {
    try {
        const PROJECTS_ROOT_DIR = process.env.PROJECTS_ROOT_DIR!
        const CONFIG_COMMAND = process.env.CONFIG_COMMAND!
        const SANITIZE_COMMAND = process.env.SANITIZE_COMMAND!

        console.log(
            PROJECTS_ROOT_DIR, CONFIG_COMMAND, SANITIZE_COMMAND
        )

        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
        }

        // Check if file is a ZIP
        if (!file.name.endsWith(".zip")) {
            return NextResponse.json({ success: false, message: "Only ZIP files are allowed" }, { status: 400 })
        }

        // Create a unique filename
        const filename = file.name

        // Convert file to buffer and save it
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const directory = await Open.buffer(buffer);
        await directory.extract({ path: PROJECTS_ROOT_DIR })

        try {
            execSync(SANITIZE_COMMAND)
            execSync(CONFIG_COMMAND)
        } catch (error) {
            console.error("Error reloading config:", error)
        }

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
