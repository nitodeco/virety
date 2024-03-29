import fs from 'fs'
import readline from 'readline'
import { execSync } from 'child_process'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Fetch default author from Node.js configuration
let author

try {
  author = execSync('npm config get init-author-name', {
    encoding: 'utf-8',
  }).trim()
} catch (error) {
  console.error('Error fetching default author:', error.message)
  rl.close()
}

let origin = 'y'

rl.question(`Author (${author}): `, (newAuthor) => {
  author = newAuthor.trim() !== '' ? newAuthor : author

  rl.question(`Project name: `, (newName) => {
    rl.question(`License: `, (license) => {
      rl.question(`Remove git origin? [y/n]: `, (newOrigin) => {
        rl.question(`Re-Initialize git? [y/n]: `, (reGit) => {
          console.log('Configuring project...')

          fs.rmdir(gitFolderPath, { recursive: true }, (err) => {
            if (err) {
              console.error('Error removing LICENSE file:', err)
            } else {
              console.log('LICENSE file removed successfully')
            }
          })

          // Read the package.json file
          fs.readFile('package.json', 'utf8', (err, data) => {
            if (err) {
              console.error('Error reading package.json:', err)
              rl.close()
              return
            }

            // Parse package.json data
            let packageJson
            try {
              packageJson = JSON.parse(data)
            } catch (jsonErr) {
              console.error('Error parsing package.json:', jsonErr)
              rl.close()
              return
            }

            // Update the name field with the new project name
            packageJson.name = newName

            // Update the author field with the default author
            packageJson.author = author

            // Update the license field with the provided license
            packageJson.license = license

            // Write the updated package.json back to file
            fs.writeFile(
              'package.json',
              JSON.stringify(packageJson, null, 2),
              (writeErr) => {
                if (writeErr)
                  console.error('Error writing package.json:', writeErr)

                origin = newOrigin

                if (origin === 'y') {
                  try {
                    execSync('git remote remove origin')
                  } catch (error) {
                    console.error(
                      'Error fetching removing origin:',
                      error.message
                    )
                  }
                }
              }
            )
          })

          if (reGit === 'y') {
            const gitFolderPath = path.join(__dirname, '.git') // Adjust path if needed

            fs.rmdir(gitFolderPath, { recursive: true }, (err) => {
              if (err) {
                console.error('Error removing .git folder:', err)
              } else {
                console.log('.git folder removed successfully')
              }
            })
          }

          console.log('Done.')
          rl.close()
        })
      })
    })
  })
})
