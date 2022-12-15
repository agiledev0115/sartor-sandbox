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
const fileLocation = `public/content/${fileName}`
fse.pathExists(fileLocation, (error, exists) => {
  if (!error) {
    if (exists) {
      console.log("File exist!, Deleting...")
      fse.remove(fileLocation)
    } else {
      console.log("File not found!")
    }
  } else {
    console.error(error)
  }
})

// 3. remove all the contents of theme folder
fse.remove("theme")

// 4. unzip to current theme // This needs fixing...!
try {
  new JSZip.external.Promise((resolve, reject) => {
    JSZipUtils.getBinaryContent("path/to/content.zip", (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  }).then(data => {
    return JSZip.loadAsync(data)
  })
  zip.folder("theme")

  zip
    .generateAsync({ type: "nodebuffer" })
    .then(content => {
      fse.outputFile(`../public/content/${fileName}`, content, error =>
        console.error(error)
      )
    })
    .catch(error => console.error(error))
} catch (error) {
  console.error(error)
}

// 5. build theme
exec("yarn theme:build")
exec("yarn add ./theme")

// 4. show success message
console.log(`Theme ${fileName} successfully installed`)
