import React from "react";
import Autocomplete from "react-google-autocomplete";
import ErrorMsg from "../ErrorMsg";
// import ErrorMessage from "../Components/Common/ErrorMessage";
// add this inside env
const GOOGLE_MAP_API_KEY = "AIzaSyCA-pKaniZ4oeXOpk34WX5CMZ116zBvy-g";
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

        onPlaceSelected={(place) => {
            callBack(place);
          setValue(fieldName, place);
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
