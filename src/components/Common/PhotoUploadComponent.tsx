import ImageUploading, { type ImageListType } from "react-images-uploading";
import { XCircleIcon } from "@heroicons/react/24/solid";

type Props = {
  onSaveCallback: () => Promise<void>;
  images: ImageListType;
  setImages: (images: ImageListType) => void;
  caption: string;
  setCaption: (caption: string) => void;
};
export default function PhotoUploadComponent({
  onSaveCallback,
  images,
  setImages,
  caption,
  setCaption,
}: Props) {
  const onContentImageChange = (imageList: ImageListType) => {
    setImages(imageList);
  };

  const saveImages = async () => {
    await onSaveCallback();
  };

  return (
    <div className="px-8">
      <ImageUploading
        multiple
        value={images}
        onChange={onContentImageChange}
        maxNumber={10}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <div className="upload__image-wrapper">
            {images.length === 0 && (
              <div
                className={`flex h-24 w-full w-full flex-col items-center justify-center rounded-lg border
                ${isDragging ? "bg-gray-400" : "bg-gray-100"}`}
                onClick={onImageUpload}
                {...dragProps}
              >
                Click or Drop An Image Here
              </div>
            )}
            &nbsp;
            {imageList.map((image, index) => (
              <div key={index} className="image-item relative">
                <img
                  className="rounded-lg border"
                  src={image.dataURL}
                  alt="space-image"
                  width="400"
                />
                <div className="absolute right-2 top-2">
                  <XCircleIcon
                    className="h-6 w-6 text-red-500 hover:h-7 hover:w-7 hover:cursor-pointer"
                    onClick={() => onImageRemove(index)}
                  />
                </div>
                <input
                  type="text"
                  className="mt-2 block w-full rounded-md border p-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder={"Caption"}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </ImageUploading>
      <div className="flex w-full justify-center gap-4">
        <button
          className="mt-4 inline-flex w-56 items-center justify-center rounded-full border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => {
            void (async () => {
              await saveImages();
            })();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
