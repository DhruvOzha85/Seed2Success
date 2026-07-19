import { ImagePlus, FileText, Upload, X } from "lucide-react";

const PHOTO_SLOTS = [
  { id: "field", label: "Field View", desc: "Overall crop condition" },
  { id: "leaf", label: "Leaf Close-Up", desc: "Visible symptoms" },
  { id: "stem", label: "Stem / Soil Zone", desc: "Root area" },
  { id: "extra", label: "Concern Area", desc: "Any unusual signs" },
];

const SINGLE_HEALTH_SLOT = [
  { id: "leaf", label: "Crop Health Photo", desc: "Upload one clear leaf or plant image" },
];

function PhotoUploader({ files, onFileChange, singleImage = false }) {
  const slots = singleImage ? SINGLE_HEALTH_SLOT : PHOTO_SLOTS;

  const handlePhotoUpload = (id, file) => {
    onFileChange("photos", singleImage ? { [id]: file } : { ...files.photos, [id]: file });
  };

  const removePhoto = (id) => {
    const nextPhotos = { ...files.photos };
    delete nextPhotos[id];
    onFileChange("photos", nextPhotos);
  };

  return (
    <div className="bg-white/70 backdrop-blur border border-brand-200 rounded-3xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-display font-bold text-gray-800">Upload Crop Image</h2>
          <p className="text-sm text-gray-500">Add a photo for AI analysis</p>
        </div>
      </div>

      <div className={`grid gap-4 ${singleImage ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"}`}>
        {slots.map((slot) => {
          const file = files.photos?.[slot.id];
          return (
            <div key={slot.id} className="relative group">
              {file ? (
                <div className={`w-full rounded-2xl border-2 border-brand-400 overflow-hidden relative shadow-sm ${singleImage ? "h-64 sm:h-80 lg:h-96" : "h-36"}`}>
                  <img src={URL.createObjectURL(file)} alt={slot.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removePhoto(slot.id)} className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform shadow-md">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-[11px] font-medium truncate">{slot.label}</p>
                  </div>
                </div>
              ) : (
                <label className={`w-full rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100 flex flex-col items-center justify-center cursor-pointer transition-colors ${singleImage ? "h-64 sm:h-80 lg:h-96" : "h-36"}`}>
                  <ImagePlus size={24} className="text-brand-500 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                  <span className="text-[13px] font-semibold text-brand-800">{slot.label}</span>
                  <span className="text-[11px] text-brand-600 mt-0.5">{slot.desc}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handlePhotoUpload(slot.id, event.target.files[0])} />
                </label>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default PhotoUploader;
