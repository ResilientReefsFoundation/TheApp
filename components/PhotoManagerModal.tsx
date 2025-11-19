import * as React from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import type { Photo } from '../types';
import { StarIcon, TrashIcon, UploadIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons';

interface PhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  onAddPhotos: (files: File[]) => void;
  onDeletePhotos: (photoIds: string[]) => void;
  onSetMainPhoto: (photoId: string) => void;
}

const FullscreenViewer: React.FC<{
  photos: Photo[];
  startIndex: number;
  onClose: () => void;
}> = ({ photos, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center" onClick={onClose}>
      <button
        className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
        onClick={onClose}
        aria-label="Close fullscreen view"
      >
        <CloseIcon className="w-6 h-6" />
      </button>

      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50"
        onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
        aria-label="Previous image"
        disabled={photos.length <= 1}
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </button>

      <div className="w-full h-full flex items-center justify-center p-16" onClick={e => e.stopPropagation()}>
        <img
          src={photos[currentIndex].url}
          alt={`Coral photo ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50"
        onClick={(e) => { e.stopPropagation(); goToNext(); }}
        aria-label="Next image"
        disabled={photos.length <= 1}
      >
        <ChevronRightIcon className="w-8 h-8" />
      </button>
    </div>
  );
};


const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  isOpen,
  onClose,
  photos,
  onAddPhotos,
  onDeletePhotos,
  onSetMainPhoto
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = React.useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = React.useState(false);
  const [fullscreenIndex, setFullscreenIndex] = React.useState<number | null>(null);
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
    if (files.length > 0) onAddPhotos(files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file: File) => file.type.startsWith('image/'));
    if (files.length > 0) onAddPhotos(files);
  };

  const toggleSelection = (photoId: string) => {
    setSelectedPhotoIds(prev =>
      prev.includes(photoId) ? prev.filter(id => id !== photoId) : [...prev, photoId]
    );
  };
  
  const handlePhotoClick = (index: number) => {
    if (isSelectMode) {
      toggleSelection(photos[index].id);
    } else {
      setFullscreenIndex(index);
    }
  };

  const handleCancelSelection = () => {
    setIsSelectMode(false);
    setSelectedPhotoIds([]);
  }

  const handleSetMainClick = () => {
    if (selectedPhotoIds.length === 1) {
      onSetMainPhoto(selectedPhotoIds[0]);
      handleCancelSelection();
    }
  };

  const handleDeleteClick = () => {
    if (selectedPhotoIds.length > 0) {
      onDeletePhotos(selectedPhotoIds);
      handleCancelSelection();
    }
  };

  const handleClose = () => {
    handleCancelSelection();
    onClose();
  }

  React.useEffect(() => {
      if(isOpen) {
          handleCancelSelection();
      }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
          <header className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-deep-sea">
              {isSelectMode ? `Selected (${selectedPhotoIds.length})` : "Photo Gallery"}
            </h2>
            {isSelectMode ? (
              <button onClick={handleCancelSelection} className="text-sm font-semibold text-ocean-blue hover:text-opacity-80">Cancel</button>
            ) : (
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">
                <CloseIcon className="w-6 h-6"/>
              </button>
            )}
          </header>

          <div className="p-6 flex-grow overflow-y-auto">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Current Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                      <div key={photo.id} className="relative group aspect-square cursor-pointer" onClick={() => handlePhotoClick(index)}>
                          <img src={photo.url} alt="coral" className={`w-full h-full object-cover rounded-lg transition-transform duration-300 ${isSelectMode ? '' : 'group-hover:scale-105'}`}/>
                          <div className={`absolute inset-0 bg-black ring-4 rounded-lg transition-all duration-300 ${selectedPhotoIds.includes(photo.id) ? 'bg-opacity-40 ring-ocean-blue' : 'bg-opacity-0 ring-transparent'}`}></div>
                          
                          {photo.isMain && (
                              <div className="absolute top-1.5 left-1.5 p-1 bg-yellow-400 rounded-full shadow-lg">
                                  <StarIcon className="w-4 h-4 text-white"/>
                              </div>
                          )}

                          {isSelectMode && (
                              <div className={`absolute top-1.5 right-1.5 p-0.5 rounded-full transition-all duration-300 ${selectedPhotoIds.includes(photo.id) ? 'bg-ocean-blue scale-100' : 'bg-white/50 scale-90 opacity-70 group-hover:opacity-100'}`}>
                                  <CheckCircleIcon className={`w-5 h-5 ${selectedPhotoIds.includes(photo.id) ? 'text-white' : 'text-gray-600'}`}/>
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
          
          <footer className="p-4 border-t bg-gray-50 rounded-b-2xl space-y-4">
            {isSelectMode ? (
              <div className="w-full flex justify-between items-center gap-4">
                  <button
                    onClick={handleSetMainClick}
                    disabled={selectedPhotoIds.length !== 1}
                    className="flex-1 flex items-center justify-center gap-2 bg-seafoam-green hover:bg-opacity-90 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <StarIcon className="w-5 h-5"/>
                    Set as Main
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    disabled={selectedPhotoIds.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="w-5 h-5" />
                    Delete ({selectedPhotoIds.length})
                  </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <button
                    onClick={() => setIsSelectMode(true)}
                    className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-deep-sea font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Select
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full sm:w-auto bg-ocean-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Done
                  </button>
              </div>
            )}
             {!isSelectMode && (
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 ${isDragging ? 'border-ocean-blue bg-blue-50' : 'border-gray-300 bg-gray-100'}`}
                >
                    <UploadIcon className="mx-auto h-10 w-10 text-gray-400"/>
                    <p className="mt-2 text-sm text-gray-600">Drag & drop to upload</p>
                    <p className="text-xs text-gray-500">or</p>
                    <label htmlFor="file-upload" className="font-medium text-ocean-blue hover:text-opacity-80 cursor-pointer">
                        browse files
                    </label>
                    <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="image/*" />
                </div>
            )}
          </footer>
        </div>
      </div>
      {fullscreenIndex !== null && (
        <FullscreenViewer
          photos={photos}
          startIndex={fullscreenIndex}
          onClose={() => setFullscreenIndex(null)}
        />
      )}
    </>
  );
};

export default PhotoManagerModal;