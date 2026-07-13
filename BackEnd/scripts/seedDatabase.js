const path = require("path");

const connectDB = require("../Config/db");
const Crop = require("../Modules/crops");
const Region = require("../Modules/region");
const DistrictCoordinate = require("../Modules/district");

if (typeof process.loadEnvFile === "function") {
  process.loadEnvFile(path.join(__dirname, "..", ".env"));
}

const crops = require("../seed-data/crops.json");
const regions = require("../seed-data/regions.json");
const districtCoordinates = require("../seed-data/districtCoordinates.json");

function buildRegionDocs(regionMap) {
  return Object.entries(regionMap).flatMap(([state, districts]) =>
    districts.map((district) => ({
      state,
      district,
    }))
  );
}

function buildDistrictDocs(coordinateMap) {
  return Object.entries(coordinateMap).flatMap(([state, districts]) =>
    Object.entries(districts).map(([district, coords]) => ({
      state,
      district,
      lat: coords.lat,
      lon: coords.lon,
    }))
  );
}

async function seedDatabase() {
  await connectDB();

  const regionDocs = buildRegionDocs(regions);
  const districtDocs = buildDistrictDocs(districtCoordinates);

  await Crop.deleteMany({});
  await Region.deleteMany({});
  await DistrictCoordinate.deleteMany({});

  await Crop.insertMany(crops);
  await Region.insertMany(regionDocs);
  await DistrictCoordinate.insertMany(districtDocs);

  console.log(
    `Seeded ${crops.length} crops, ${regionDocs.length} regions, and ${districtDocs.length} district coordinates.`
  );
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Database seed failed:", error.message);
    process.exit(1);
  });
