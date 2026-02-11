import express from 'express'
import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import iconv from 'iconv-lite'

const router = express.Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

// POST /api/gemini - Call Gemini API
router.post('/', async (req, res) => {
  try {
    const { query, mode, language, answer, lang } = req.body

    // Build feature string based on mode
    const feature = `
Language: ${language}
Mode: ${mode}
Add both Chinese (zh) and English (en) versions in your response.
User's answer (if any): ${answer || 'Not provided'}
`.trim()

    // Call Python script
    const result = await callPythonGemini(query, feature, lang)
    res.json(result)
  } catch (error) {
    console.error('Error calling Gemini:', error)
    res.status(500).json({
      error: 'Failed to call Gemini API',
      details: error.message,
    })
  }
})

// Helper function to call Python script
function callPythonGemini(query, feature, lang) {
  return new Promise((resolve, reject) => {
    // Use the virtual environment Python on Windows or system Python on Unix
    const pythonCmd = process.platform === 'win32' 
      ? join(projectRoot, '.venv', 'Scripts', 'python.exe')
      : join(projectRoot, '.venv', 'bin', 'python')
    
    // Avoid inheriting broken local proxy settings into Gemini API calls.
    const childEnv = {
      ...process.env,
      HTTP_PROXY: '',
      HTTPS_PROXY: '',
      ALL_PROXY: '',
      http_proxy: '',
      https_proxy: '',
      all_proxy: '',
      NO_PROXY: process.env.NO_PROXY || 'localhost,127.0.0.1,::1',
      no_proxy: process.env.no_proxy || 'localhost,127.0.0.1,::1',
    }

    const pythonProcess = spawn(
      pythonCmd,
      [
        join(projectRoot, 'call_gemini.py'),
        '--query',
        query,
        '--feature',
        feature,
        '--key-file',
        join(projectRoot, '.gmini_api_key'),
      ],
      {
        cwd: projectRoot,
        env: childEnv,
      }
    )

    let outputBuffer = []
    let errorOutput = ''

    pythonProcess.stdout.on('data', (data) => {
      outputBuffer.push(data)
    })

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString('utf8')
    })

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`))
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python error:', errorOutput)
        return reject(new Error(`Python script failed with code ${code}`))
      }

      try {
        // Decode buffer to UTF-8 string
        const output = Buffer.concat(outputBuffer).toString('utf8')
        
        // Extract JSON from output, handling warnings and extra text
        const startIdx = output.indexOf('{')
        const endIdx = output.lastIndexOf('}')
        
        if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
          console.error('Cannot find JSON in output:', output.substring(0, 500))
          const details = errorOutput || output.substring(0, 300)
          return reject(new Error(`No JSON found in Python output. Details: ${details}`))
        }
        
        const jsonStr = output.substring(startIdx, endIdx + 1)
        const result = JSON.parse(jsonStr)
        resolve(result)
      } catch (err) {
        reject(err)
      }
    })
  })
}

export default router
