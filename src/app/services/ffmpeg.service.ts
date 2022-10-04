import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})

//this service will be injected to the upload component
export class FfmpegService {
  isRunning = false
  isReady = false
  private ffmpeg

  constructor() {
    this.ffmpeg = createFFmpeg({
      log: true
    })
  }

  async init() {
    if (this.isReady) {
      return
    }

    await this.ffmpeg.load()
    // prevent ffmpeg from reloading by changing isReady to true
    this.isReady = true
  }

  //  To store the ffmpeg to separate memory storage
  // Otherwise it won't be able to manipulate the file
  // Before sending the file it needs to be converted to binary data
  async getScreenshots(file: File) {
    const data = await fetchFile(file)

    // FS - file system -> gives access to the packages
    // independent memory system
    // The file is needed to be stored before running any commands
    // Read, Write and Delete files from the files system
    this.ffmpeg.FS('writeFile', file.name, data)
    // https://ffmpeg.org/ffmpeg.html <-- Documentation for Using FFmpegTool
    // After storing the file ->
    // -> run following command

    // picking a series of screenshots
    const seconds = [1, 2, 3]
    const commands: string[] = []

    // looping through seconds array
    // a series of commands should be pushed for every item in the seconds array
    // one item === one screenshot (for ex: 6items in the array = 6 screenshots)
    // having multiple inputs & outputs under a single ffmpeg proccess 
    seconds.forEach(second => {
      commands.push(
        // Input -> -i - grab a specific file from file system - the file can be access by the name
        '-i', file.name,
        // Output Options  --> ss allows to configure the timestamp 'hh:mm:ss' - by default the timestamp is set to the beginning of the video
        '-ss', `00:00:0${second}`,
        // video frames will move from one image to another to create effect of a video playing 
        '-frames:v', '1',
        // select the aspect ratio 'scale=width:height:' scale=510:-1 widht=510, height=-1(auto)  
        '-filter:v', 'scale=510:-1',
        // Output
        // provide name for file(the screenshot)
        `output_0${second}.png`
      )
    })

    await this.ffmpeg.run(
      // run() expects a list o strings as an agrument ->  
      // -> it does not want an array of strings
      //  -> this problem can be solved by using the spread operator with the commands array
      ...commands

        // Input -> -i - grab a specific file from file system - the file can be access by the name
        // '-i', file.name,
        // Output Options  --> ss allows to configure the timestamp 'hh:mm:ss' - by default the timestamp is set to the beginning of the video
        // '-ss', '00:00:01',
        // video frames will move from one image to another to create effect of a video playing 
        // '-frames:v', '1',
        // select the aspect ratio 'scale=width:height:' scale=510:-1 widht=510, height=-1(auto)  
        // '-filter:v', 'scale=510:-1',
        // Output
        // provide name for file(the screenshot)
        // 'output_01.png'
    )

    const screenshots: string[] = []
    // while this is true, the compoenent should render an animated
    // icon to indicate the command is running
    this.isRunning = true

    seconds.forEach(second => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile', `output_0${second}.png`
        )
        const screenshotBlob = new Blob(
          [screenshotFile.buffer], {
            type: 'image/png'
          }
        )

        const screenshotURL = URL.createObjectURL(screenshotBlob)

        screenshots.push(screenshotURL)
    })
    this.isRunning = false;
    return screenshots
  }

  async blobFromUrl(url: string) {
    const response = await fetch(url)
    const blob = await response.blob()

    return blob
  }
}


