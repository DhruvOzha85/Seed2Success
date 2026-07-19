import { Bug } from "lucide-react";

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 mb-2 pb-2 border-b border-black/5 last:border-0 last:mb-0 last:pb-0">
      <span className="text-[12px] font-bold text-black/60 w-24 flex-shrink-0">{label}</span>
      <span className="text-[13px] font-medium text-black/80">{Array.isArray(value) ? value.join(", ") : value}</span>
    </div>
  );
}

function ActionCardsPhase2({ result }) {
  if (!result) return null;

  const diseaseDetection = result.diseaseDetection;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6 px-2">
        <h3 className="font-display font-bold text-xl text-brand-900">Crop Health Analysis</h3>
        <div className="h-px flex-1 bg-brand-200"></div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {diseaseDetection ? (
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-3xl p-6 border border-rose-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-200/40 rounded-full blur-2xl group-hover:bg-rose-300/40 transition-colors"></div>
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200">
                <Bug size={20} />
              </div>
              <h4 className="font-display font-bold text-rose-900 leading-tight">Image Health Detection</h4>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-rose-100">
              <InfoRow label="Plant Name" value={diseaseDetection.plant} />
              <InfoRow label="Health Status" value={diseaseDetection.health_status} />
              <InfoRow label="Disease" value={diseaseDetection.disease_name} />
              <InfoRow
                label="Health Score"
                value={
                  typeof diseaseDetection.health_percentage === "number"
                    ? `${Math.round(diseaseDetection.health_percentage)}%`
                    : diseaseDetection.health_percentage
                }
              />
              <InfoRow label="Cure" value={diseaseDetection.cure} />
              <InfoRow label="Precaution" value={diseaseDetection.precaution} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ActionCardsPhase2;
