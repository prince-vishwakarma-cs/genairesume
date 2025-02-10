import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const server = import.meta.env.VITE_SERVER;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: { phone: "", location: "" },
    urls: [{ title: "", url: "" }],
    experience: [
      { organisation: "", job_role: "", description: [""], from: "", to: "" },
    ],
    academics: [
      { institute: "", degree: "", achievements: "", from: "", to: "" },
    ],
    projects: [{ title: "", description: [""], techstack: "", github: "" }],
    additional_info: { skills: "", certifications: "" },
  });

  const [aiLoading, setAiLoading] = useState({});

  const handleChange = (e, index, section, field) => {
    const newData = { ...formData };

    if (section) {
      newData[section][index][field] = e.target.value;
    } else {
      newData[e.target.name] = e.target.value;
    }

    setFormData(newData);
  };

  const handleArrayChange = (e, itemIndex, section, field, arrayIndex) => {
    const newData = { ...formData };
    newData[section][itemIndex][field][arrayIndex] = e.target.value;
    setFormData(newData);
  };

  const addDescriptionLine = (itemIndex, section) => {
    const newData = { ...formData };
    newData[section][itemIndex].description.push("");
    setFormData(newData);
  };

  const removeDescriptionLine = (itemIndex, section, arrayIndex) => {
    const newData = { ...formData };
    if (newData[section][itemIndex].description.length > 1) {
      newData[section][itemIndex].description.splice(arrayIndex, 1);
      setFormData(newData);
    }
  };

  const addField = (section, template) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], template],
    }));
  };

  const removeField = (section, index) => {
    setFormData((prev) => {
      if (prev[section].length === 1) return prev;
      const newSection = [...prev[section]];
      newSection.splice(index, 1);
      return { ...prev, [section]: newSection };
    });
  };

  const handleAICall = async (section, itemIndex, descIndex) => {
    const item = formData[section][itemIndex];
    let title = "";
    if (section === "experience") {
      title = item.organisation;
    } else {
      title = item.title;
    }
    const description = item.description[descIndex];
    try {
      setAiLoading((prev) => ({
        ...prev,
        [`${section}-${itemIndex}-${descIndex}`]: true,
      }));
      const response = await axios.post(`${server}/api/ai/`, {
        category: section,
        title: title,
        description: description,
      });
      console.log(response);
      if (response.data) {
        setFormData((prev) => {
          const updatedSection = [...prev[section]];
          const updatedDescriptions = [
            ...updatedSection[itemIndex].description,
          ];
          updatedDescriptions[descIndex] = response.data.message;
          updatedSection[itemIndex] = {
            ...updatedSection[itemIndex],
            description: updatedDescriptions,
          };
          return { ...prev, [section]: updatedSection };
        });
      }
    } catch (error) {
      console.error("Error calling AI API:", error);
      alert("Failed to fetch AI generated content.");
    } finally {
      setAiLoading((prev) => ({
        ...prev,
        [`${section}-${itemIndex}-${descIndex}`]: false,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const removeEmptyFields = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(removeEmptyFields).filter((item) => {
          if (typeof item === "string") return item.trim() !== "";
          return Object.keys(item).length > 0;
        });
      } else if (typeof obj === "object" && obj !== null) {
        return Object.fromEntries(
          Object.entries(obj)
            .map(([key, value]) => [key, removeEmptyFields(value)])
            .filter(
              ([, value]) =>
                value !== "" && value !== null && value !== undefined
            )
        );
      }
      return obj;
    };

    const filteredData = removeEmptyFields(formData);

    try {
      const response = await axios.post(
        `${server}/api/resume/new`,
        filteredData,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);

      alert("Resume downloaded successfully!");
    } catch (error) {
      console.error("Error creating resume:", error);
      alert("Failed to create resume");
    }
  };

  return (
    <div className="isolate bg-white !px-6 !py-24 !sm:py-32 !lg:px-8 max-w-5xl mx-auto">
      <div
        className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
        aria-hidden="true"
      >
        <div
          className="relative left-1/2 -z-10 aspect-1155/678 w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#89fcc1] to-[#fcd689] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        ></div>
        <div
          className="relative left-1/2 -z-10 aspect-1155/678 w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff8080] to-[#89fcc1] opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        ></div>
      </div>
      <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl !py-4">
        Create Your Resume
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <h3 className="text-lg font-medium mb-2 flex justify-between items-center capitalize text-gray-800">
          Basic Info
        </h3>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-900"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-900"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-900"
            >
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.contact.phone}
              onChange={(e) => handleChange(e, 0, "contact", "phone")}
              placeholder="Phone Number"
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-gray-900"
            >
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.contact.location}
              onChange={(e) => handleChange(e, 0, "contact", "location")}
              placeholder="Location"
              className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
            />
          </div>
        </div>

        {/* Dynamic Sections */}
        {["urls", "experience", "academics", "projects"].map((section) => (
          <div key={section}>
            <h3 className="text-lg font-medium mb-2 flex justify-between items-center capitalize text-gray-800">
              <div>{section}</div>
              <div>
                {Object.values(
                  formData[section][formData[section].length - 1]
                ).every((value) => value) && (
                  <button
                    type="button"
                    onClick={() =>
                      addField(
                        section,
                        Object.fromEntries(
                          Object.keys(formData[section][0]).map((key) => [
                            key,
                            // For experience and projects, initialize description as an array
                            key === "description" &&
                            (section === "experience" || section === "projects")
                              ? [""]
                              : "",
                          ])
                        )
                      )
                    }
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-2 focus:outline-indigo-600"
                  >
                    Add {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                )}
              </div>
            </h3>
            {formData[section].map((item, index) => (
              <div key={index}>
                {index > 0 && (
                  <div className="border-t border-gray-300 my-4"></div>
                )}
                <div className="flex flex-wrap gap-4 w-full">
                  {Object.keys(item).map((field) => {
                    if (
                      (section === "experience" || section === "projects") &&
                      field === "description"
                    ) {
                      return (
                        <div key={field} className="flex-grow min-w-[250px]">
                          <label
                            htmlFor={field}
                            className="block text-sm font-semibold text-gray-900 capitalize mb-1"
                          >
                            {field}
                          </label>
                          {item.description.map((desc, descIndex) => (
                            <div
                              key={descIndex}
                              className="flex items-center gap-2 mb-2"
                            >
                              <input
                                type="text"
                                value={desc}
                                onChange={(e) =>
                                  handleArrayChange(
                                    e,
                                    index,
                                    section,
                                    field,
                                    descIndex
                                  )
                                }
                                placeholder={`Description ${descIndex + 1}`}
                                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                              />
                              {String(
                                section === "experience"
                                  ? item.organisation
                                  : item.title
                              ).trim() !== "" &&
                                String(desc).trim() !== "" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAICall(section, index, descIndex)
                                    }
                                    disabled={
                                      aiLoading[
                                        `${section}-${index}-${descIndex}`
                                      ]
                                    }
                                    className="rounded-md bg-blue-600 px-2 py-1 text-sm text-white"
                                  >
                                    {aiLoading[
                                      `${section}-${index}-${descIndex}`
                                    ]
                                      ? "..."
                                      : "AskAi"}
                                  </button>
                                )}
                              {descIndex === item.description.length - 1 &&
                                String(desc).trim() !== "" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addDescriptionLine(index, section)
                                    }
                                    className="rounded-md bg-green-600 px-2 py-1 text-sm text-white"
                                  >
                                    Add
                                  </button>
                                )}
                              {item.description.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeDescriptionLine(
                                      index,
                                      section,
                                      descIndex
                                    )
                                  }
                                  className="rounded-md bg-red-600 px-2 py-1 text-sm text-white"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div key={field} className="flex-grow min-w-[250px]">
                          <label
                            htmlFor={field}
                            className="block text-sm font-semibold text-gray-900 capitalize mb-1"
                          >
                            {field}
                          </label>
                          <input
                            type={
                              field === "from" || field === "to"
                                ? "date"
                                : "text"
                            }
                            value={item[field]}
                            onChange={(e) =>
                              handleChange(e, index, section, field)
                            }
                            placeholder={
                              field === "from" || field === "to"
                                ? "Select Date"
                                : field.charAt(0).toUpperCase() + field.slice(1)
                            }
                            className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600"
                            onFocus={
                              field === "from" || field === "to"
                                ? (e) =>
                                    e.target.showPicker && e.target.showPicker()
                                : undefined
                            }
                          />
                        </div>
                      );
                    }
                  })}
                  {formData[section].length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(section, index)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        <button
          type="submit"
          className="block w-full rounded-md bg-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-2 focus:outline-indigo-600"
        >
          Generate Resume
        </button>
      </form>
    </div>
  );
};

export default App;
