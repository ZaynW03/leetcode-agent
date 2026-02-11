import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..', '..')

export function callPythonGemini({ query, feature, module, task = 'generate' }) {
  return new Promise((resolve, reject) => {
    const pythonCmd = process.platform === 'win32'
      ? join(projectRoot, '.venv', 'Scripts', 'python.exe')
      : join(projectRoot, '.venv', 'bin', 'python')

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

    const args = [
      join(projectRoot, 'call_gemini.py'),
      '--query',
      query || '',
      '--feature',
      feature || '',
      '--task',
      task,
      '--key-file',
      join(projectRoot, '.gmini_api_key'),
    ]

    if (module) {
      args.push('--module', module)
    }

    const pythonProcess = spawn(pythonCmd, args, {
      cwd: projectRoot,
      env: childEnv,
    })

    const outputBuffer = []
    let errorOutput = ''

    pythonProcess.stdout.on('data', (data) => outputBuffer.push(data))
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString('utf8')
    })

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`))
    })

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Python script failed with code ${code}. ${errorOutput}`))
      }

      try {
        const output = Buffer.concat(outputBuffer).toString('utf8').trim()
        const startIdx = output.indexOf('{')
        const endIdx = output.lastIndexOf('}')
        if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
          return reject(new Error(`No JSON found in Python output: ${output.slice(0, 300)}`))
        }
        const jsonStr = output.substring(startIdx, endIdx + 1)
        resolve(JSON.parse(jsonStr))
      } catch (err) {
        reject(err)
      }
    })
  })
}

