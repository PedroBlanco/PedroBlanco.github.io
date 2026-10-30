FOSS Python tool for **extracting individual photographs from scanned PDF documents**, especially when multiple photos appear separately on a single page.

### How it works

The tool renders PDF pages using **pypdfium2**, detects photographs with an adapted `autocrop` implementation, crops them and can automatically correct their rotation. It exports JPEG or PNG images.

### Requirements and usage

Requires **Python 3.11 or later** and the dependencies listed in the repository (including pypdfium2, Pillow and NumPy). After installing the package:

```sh
pdf-fotos-a-imagenes album.pdf
```

Multiple PDFs, folders and custom output directories are supported. The repository's documentation describes quality, resolution and background calibration options.

### License

Released as free software under **GPL-3.0-only**. See the repository and third-party notices for full licensing terms.
