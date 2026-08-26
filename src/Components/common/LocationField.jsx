import React from "react";
import Autocomplete from "react-google-autocomplete";
import ErrorMsg from "../ErrorMsg";
// import ErrorMessage from "../Components/Common/ErrorMessage";
// add this inside env
const GOOGLE_MAP_API_KEY = "AIzaSyDRb_BGMWY3XocACa_K976a0g6y-5QwkqU";
const LocationField = ({
  fieldName,
  options,
  formConfig,
  type = "text",
  label,
  className = "commonInput",
  placeholder,
  rules,
  callBack,
}) => {
  const {
    register,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = formConfig;
  const address = watch(fieldName);

  return (
    <div>
      <div className="label text-[16px] text-[#3E3232] font-[600]">{label}</div>
      <Autocomplete
        {...register(fieldName, {
          ...rules,
          validate: (value) => {
            if (!value || (typeof value === "string" && value.trim() === "")) {
              return rules?.required || "This field is required";
            }
            return true;
          },
          onChange: (e) => {
            setValue(fieldName, e.target.value);
            clearErrors(fieldName);
          },
        })}
        // apiKey="AIzaSyCA-pKaniZ4oeXOpk34WX5CMZ116zBvy-g"
        apiKey="AIzaSyDRb_BGMWY3XocACa_K976a0g6y-5QwkqU"

        onPlaceSelected={async (place) => {
          try {
            setValue(fieldName, place?.formatted_address || "");
            clearErrors(fieldName);

            const addressComponents = place?.address_components;
            console
            const zipCodeObj = addressComponents?.find(
              (component) => component.types.includes("postal_code")
            );
            const countryObj = addressComponents?.find((component) =>
              component.types.includes("country")
            );

            const country = countryObj ? countryObj.long_name : null;
            setValue("country", country);

            const zipCode = zipCodeObj ? zipCodeObj.long_name : null;
            setValue("zip_code", zipCode);

            const { lat, lng } = place.geometry.location;
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/timezone/json?location=${lat()},${lng()}&timestamp=${Math.floor(
                  Date.now() / 1000
                )}&key=${GOOGLE_MAP_API_KEY}`
              );
              const data = await response.json();
              if (data.status === "OK") {
                const rawOffset = data.rawOffset || 0;
                const dstOffset = data.dstOffset || 0;
                const totalOffset = rawOffset + dstOffset;

                const totalOffsetHours = totalOffset / 3600;
                const hours = Math.trunc(totalOffsetHours);
                const minutes = Math.abs(
                  Math.round((totalOffsetHours - hours) * 60)
                );

                const sign = hours >= 0 ? "+" : "-";
                const hh = String(Math.abs(hours)).padStart(2, "0");
                const mm = String(minutes).padStart(2, "0");
                const utcOffsetString = `UTC ${sign}${hh}:${mm}`;
                const timezone = data.timeZoneId;
                const formattedResponse = `${timezone} ${utcOffsetString}`;
                setValue("time_zone", formattedResponse);
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error("Error calling Google Timezone API: ", error);
            }

            if (typeof callBack === "function") {
              await callBack(place);
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error("onPlaceSelected error:", err);
          }
        }}
        value={address?.formatted_address || address}
        options={options}
        placeholder={placeholder}
        onBlur={(e) => {
          if (typeof address !== "object" || !address?.formatted_address) {
            setValue(fieldName, "");
            
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className={className}
      />
      {errors[fieldName] && (
        <ErrorMsg error={errors[fieldName]?.message}
        />
      )}
    </div>
  );
};

export default LocationField;
