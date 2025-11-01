import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST() {
  try {
    const scriptPath = path.join(process.cwd(), "scripts", "train_faces.py");

    const output = await runPythonScript(scriptPath);

    return NextResponse.json({
      message: "Training completed successfully",
      output,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Training failed", error: error.message || error },
      { status: 500 }
    );
  }
}

// ✅ Helper to run python safely and return stdout
function runPythonScript(scriptPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn("python", [scriptPath]);

    let output = "";
    let errorOutput = "";

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(errorOutput || `Exited with code ${code}`));
      }
    });

    process.on("error", (err) => {
      reject(err);
    });
  });
}
