const fse = require("fs-extra")
const JSZip = require("jszip")
const zip = new JSZip()

// first argument is *.zip file name
let fileName = "theme.zip"

// 1. change fileName if arg passed
const arg = process.argv.slice(2)[0]
if (arg) {
  fileName = arg
}

// 2. delete zip if exists
fse.pathExists(`public/content/${fileName}`, (error, exists) => {
  if (!error) {
    if (exists) {
      console.log("exist")
    } else {
      console.log("no")
    }
  } else {
    console.error(error)
  }
})

// 3. zip current theme
try {
  zip.folder("theme")

  zip
    .generateAsync({ type: "nodebuffer" })
    .then(content => {
      fse.outputFile(
        toString(content),
        `../public/content/${fileName}`,
        error => console.error(error)
      )
    })
    .catch(error => console.error(error))
} catch (error) {
  console.error(error)
}

// 4. show success message
console.log("success")
