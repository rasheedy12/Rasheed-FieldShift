# Rasheed FieldShift — Environmental Data Dictionary

## 1. Principles of Data Provenance and Integrity

- **Regional Scale**: NASA POWER is gridded, model-derived and satellite-assimilated environmental data at ~0.5° × 0.5° or ~0.625° × 0.5° spatial resolution. It represents regional conditions, **not** direct farm-level or sensor readings.
- **Handling Missing Values**: NASA POWER encodes missing or invalid observations as `-999.0` (or `-999`). These must **never** be silently converted to zero (especially for rainfall or temperature), but flagged as invalid/missing.
- **Root-Zone Soil Wetness**: `GWETROOT` is a dimensionless wetness fraction (0 to 1), **not** volumetric soil moisture.
- **No Direct Fertility Inference**: Satellite and meteorological estimates do not measure or imply soil nitrogen, phosphorus, or general soil fertility directly.

---

## 2. Parameter Specifications

| Parameter Code | Description | Source / System | Community | Units | Missing Value Flag | Notes & Caveats |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PRECTOTCORR` | Corrected total precipitation | NASA POWER (MERRA-2 / GPCP assimilation) | `AG` (Agroclimatology) | mm/day | `-999.0` | Gauge-corrected model estimate; regional aggregate. |
| `T2M` | Air temperature at 2 meters | NASA POWER (MERRA-2) | `AG` (Agroclimatology) | °C | `-999.0` | 2-meter air temperature daily average. |
| `GWETROOT` | Root-zone soil wetness fraction | NASA POWER (MERRA-2 Land Model) | `HY` (Hydrology) | Dimensionless (0–1 fraction) | `-999.0` | Indicates relative wetness of the root zone, not volumetric moisture content. |

---

## 3. Location References

- **Primary Reference**: Azare, Katagum LGA, Bauchi State, Nigeria
- **Coordinates**: Latitude `11.6765° N`, Longitude `10.1911° E`
- **Agroecological Zone**: Sudan Savanna (semi-arid, unimodal rainy season typically June–September)

