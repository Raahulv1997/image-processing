import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'cropperjs/dist/cropper.css';
import Cropper from 'react-cropper';

function FileUpload() {
  const [imageURL, setImageURL] = useState(null);
  const [processedImageURL, setProcessedImageURL] = useState(null);
  const [file, setFile] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff'); // Default background color
  const [isCropping, setIsCropping] = useState(false);
  const [isBackgroundRemoved, setIsBackgroundRemoved] = useState(false);
  const [showOriginalImage, setShowOriginalImage] = useState(true); // New state variable
  const [isLoading, setIsLoading] = useState(false); // New state variable for loading
  const cropperRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
    const url = URL.createObjectURL(file);
    setImageURL(url);
    setProcessedImageURL(null); // Reset processed image URL
    setIsCropping(false); // Disable cropping
    setIsBackgroundRemoved(false); // Reset background removed flag
    setShowOriginalImage(true); // Show original image on file change
    setIsLoading(false); // Reset loading state
  };

  const handleCrop = () => {
    const cropper = cropperRef.current.cropper;
    const croppedCanvas = cropper.getCroppedCanvas();
    croppedCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setProcessedImageURL(url);
      setFile(new File([blob], 'cropped_image.png', { type: 'image/png' }));
      setIsCropping(false); // Disable cropping
      setShowOriginalImage(true); // Show original image after processing
    });
  };

  const handleColorChange = (event) => {
    setBackgroundColor(event.target.value);
  };

  const removeBackgroundHandler = () => {
    setIsLoading(true); // Set loading state to true
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');

    const apiKey = 'H8yzd3y11RKnGstTAJLhZE1L';

    fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey
      },
      body: formData
    })
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setProcessedImageURL(url);
        setIsBackgroundRemoved(true); // Set background removed flag
        setShowOriginalImage(true); // Show original image after processing
        setIsLoading(false); // Set loading state to false
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false); // Set loading state to false even on error
      });
  };

  const changeBackgroundColorHandler = () => {
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');
    formData.append('bg_color', backgroundColor.replace('#', ''));

    const apiKey = 'H8yzd3y11RKnGstTAJLhZE1L';

    fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey
      },
      body: formData
    })
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setProcessedImageURL(url);
      })
      .catch(err => console.error(err));
  };

  const downloadFile = (url) => {
    const anchorElement = document.createElement('a');
    anchorElement.href = url;
    anchorElement.download = 'processed_image.png';
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 card p-4 shadow-sm">
          <h2 className="text-center mb-4">Image Processing</h2>
          <form>
            <div className="form-group">
              <label htmlFor="fileInput">Select a File:</label>
              <input
                id="fileInput"
                className="form-control"
                type="file"
                onChange={handleFileChange}
              />
            </div>
          </form>

          {imageURL && showOriginalImage && (
            <div className="text-center mt-3">
              <button className="btn btn-primary m-1" onClick={() => { setIsCropping(true); setShowOriginalImage(false); }}>
                Crop Image
              </button>
              <button className="btn btn-primary m-1" onClick={() => { removeBackgroundHandler(); setShowOriginalImage(false); }}>
                Remove Background
              </button>
            </div>
          )}

          {isCropping && imageURL && (
            <div className="text-center mt-3">
              <Cropper
                src={imageURL}
                style={{ height: 400, width: '100%' }}
                initialAspectRatio={1}
                guides={false}
                ref={cropperRef}
              />
              <button className="btn btn-primary mt-2" type="button" onClick={handleCrop}>
                Apply Crop
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center mt-3">
              <div className="spinner-border text-primary" role="status">
             
              </div>
            </div>
          )}

          <div className="row mt-4 text-center">
            {imageURL && showOriginalImage && !isLoading && (
              <div className="col-md-6">
                <h5>Original Image</h5>
                <img src={imageURL} alt="Original" className="img-fluid rounded" />
              </div>
            )}
            {processedImageURL && (
              <div className="col-md-6">
                <h5>Processed Image</h5>
                <img src={processedImageURL} alt="Processed" className="img-fluid rounded" />
              </div>
            )}
          </div>

          {isBackgroundRemoved && (
            <div className="form-group mt-3 col-md-4 text-center">
              <label htmlFor="colorInput">Select Background Color:</label>
              <input
                id="colorInput"
                className="form-control"
                type="color"
                value={backgroundColor}
                onChange={handleColorChange}
              />
              <button className="btn btn-secondary mt-2" onClick={changeBackgroundColorHandler}>
                Change Background Color
              </button>
            </div>
          )}

          {processedImageURL && (
            <div className="text-center mt-3">
              <button className="btn btn-warning" onClick={() => downloadFile(processedImageURL)}>
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
