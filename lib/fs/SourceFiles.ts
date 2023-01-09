import { createReadStream, ReadStream } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export class SourceFiles
  implements AsyncIterable<{ stream: ReadStream; file: string }>
{
  private srcFiles: Promise<string[]>

  constructor(private path: string) {
    this.srcFiles = readdir(this.path)
      .then(res => res)
      .catch(() => [])
  }

  get names(): Promise<string[]> {
    return (
      this.srcFiles?.then(files => files.filter(file => /\.svg$/.test(file))) ??
      Promise.resolve([])
    )
  }

  async *[Symbol.asyncIterator]() {
    const names = await this.names
    for (const file of names) {
      yield { file, stream: createReadStream(join(this.path, file)) }
    }
    return { done: true }
  }
}
