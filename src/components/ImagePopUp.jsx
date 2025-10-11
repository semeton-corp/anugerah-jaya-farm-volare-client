import React from "react";

const ImagePopUp = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg max-w-[90vw] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none cursor-pointer"
        >
          ✕
        </button>

        {/* Image */}
        <img
          src={imageUrl}
          alt="Bukti Pembayaran"
          className="object-contain max-h-[80vh] max-w-[85vw] rounded-md"
        />

        <div className="p-3 text-center text-sm text-gray-600 truncate max-w-[80vw]">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-green-700 hover:text-green-900"
          >
            Lihat Gambar Asli
          </a>
        </div>
      </div>
    </div>
  );
};

export default ImagePopUp;
