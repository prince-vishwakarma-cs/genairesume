
import { Resume } from "../models/resume.js";
import { TryCatch } from "../middleware/error.js";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";

  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  const options = { year: "numeric", month: "long" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  const today = new Date();
  const todayFormatted = today.toLocaleDateString("en-US", options);

  return formattedDate === todayFormatted ? "Present" : formattedDate;
};

import {chromium} from "playwright"

const export_resume = async (resumeId, res) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Prepare your HTML content (same as before)
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Professional Resume</title>
        <style>
            body {
                font-family: Georgia, serif;
                margin: 40px auto;
                width: 800px;
                line-height: 1.5;
                color: #333;
            }
            h1 { font-size: 24px; margin-bottom: 0px; margin-top: 0px; }
            h2 { font-size: 18px; margin-top: 8px; margin-bottom: 8px; text-transform: uppercase; border-bottom: 2px solid #444; }
            p { margin: 0px 0px; }
            .contact { font-size: 16px; }
            .contact a { text-decoration: none; color: #0073e6; }
            .section { margin-bottom: 0px; }
            .company { font-weight: bold; }
            .job-title { font-style: italic; }
            .date { float: right; font-size: 16px; color: #232323; }
            ul { margin-top: 0px; margin-bottom: 0px; padding-left: 20px; }
            li { margin-bottom: 0px; }
        </style>
    </head>
    <body>
    
        <h1>${resume.name}</h1>
        
        ${
          resume.email ||
          resume.contact?.phone ||
          resume.contact?.location ||
          (resume.urls && resume.urls.length)
            ? `
        <p class="contact">
            ${
              resume.email
                ? `<a href="mailto:${resume.email}">${resume.email}</a> | `
                : ""
            }
            ${resume.contact?.phone ? resume.contact.phone + " | " : ""}
            ${resume.contact?.location ? resume.contact.location + " | " : ""}
            ${
              resume.urls?.length
                ? resume.urls
                    .map(
                      (link) =>
                        `<a href="${link.url}" target="_blank">${link.title}</a>`
                    )
                    .join(" | ")
                : ""
            }
        </p>`
            : ""
        }
    
        ${
          resume.academics?.length
            ? `
        <div class="section">
            <h2>Education</h2>
            ${resume.academics
              .map(
                (edu) => `
                <div><span class="company">${edu.institute}</span>
                <span class="date">${formatDate(edu.from)} – ${formatDate(
                  edu.to
                )}</span></div>
                <div class="job-title">${edu.degree}</div>
                ${
                  edu.achievements?.length
                    ? `<ul><li>Achievements: ${edu.achievements.join(
                        ", "
                      )}</li></ul>`
                    : ""
                }
            `
              )
              .join("")}
        </div>`
            : ""
        }
    
        ${
          resume.experience?.length
            ? `
        <div class="section">
            <h2>Experience</h2>
            ${resume.experience
              .map(
                (exp) => `
                <div><span class="company">${exp.organisation}</span>
                <span class="date">${formatDate(exp.from)} – ${formatDate(
                  exp.to
                )}</span></div>
                <div class="job-title">${exp.job_role}</div>
                ${
                  exp.description?.length
                    ? `<ul>${exp.description
                        .map((desc) => `<li>${desc}</li>`)
                        .join("")}</ul>`
                    : ""
                }
            `
              )
              .join("")}
        </div>`
            : ""
        }
    
        ${
          resume.projects?.length
            ? `
        <div class="section">
            <h2>Projects</h2>
            ${resume.projects
              .map(
                (proj) => `
                <div><span class="company">${proj.title}</span></div>
                ${
                  proj.description?.length
                    ? `<ul>${proj.description
                        .map((desc) => `<li>${desc}</li>`)
                        .join("")}</ul>`
                    : ""
                }
                <ul>
                    ${
                      proj.techstack?.length
                        ? `<li><b>Tech Stack:</b> ${proj.techstack.join(", ")}</li>`
                        : ""
                    }
                    ${
                      proj.github
                        ? `<li><b>GitHub:</b> <a href="${proj.github}" target="_blank">${proj.github}</a></li>`
                        : ""
                    }
                </ul>
            `
              )
              .join("")}
        </div>`
            : ""
        }
    
        ${
          resume.additional_info?.skills?.length ||
          resume.additional_info?.certifications?.length
            ? `
        <div class="section">
            <h2>Skills & Certifications</h2>
            <ul>
                ${
                  resume.additional_info.skills?.length
                    ? `<li><b>Technical Skills:</b> ${resume.additional_info.skills.join(
                        ", "
                      )}</li>`
                    : ""
                }
                ${
                  resume.additional_info.certifications?.length
                    ? `<li><b>Certifications:</b> ${resume.additional_info.certifications.join(
                        ", "
                      )}</li>`
                    : ""
                }
            </ul>
        </div>`
            : ""
        }
    
    </body>
    </html>
    `;

    // Launch Playwright's Chromium browser
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { bottom: '0.25in', left: '0.25in', right: '0.25in' }
    });
    
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.name}_resume.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const export_resume = async (resumeId, res) => {
//   try {
//     const resume = await Resume.findById(resumeId);
//     if (!resume) return res.status(404).json({ message: "Resume not found" });

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });

//     const page = await browser.newPage();

//     const htmlContent = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Professional Resume</title>
//     <style>
//         body {
//             font-family: Georgia, serif;
//             margin: 40px auto;
//             width: 800px;
//             line-height: 1.5;
//             color: #333;
//         }
//         h1 { font-size: 24px; margin-bottom: 0px; margin-top: 0px; }
//         h2 { font-size: 18px; margin-top: 8px; margin-bottom: 8px; text-transform: uppercase; border-bottom: 2px solid #444; }
//         p { margin: 0px 0px; }
//         .contact { font-size: 16px; }
//         .contact a { text-decoration: none; color: #0073e6; }
//         .section { margin-bottom: 0px; }
//         .company { font-weight: bold; }
//         .job-title { font-style: italic; }
//         .date { float: right; font-size: 16px; color: #232323; }
//         ul { margin-top: 0px; margin-bottom: 0px; padding-left: 20px; }
//         li { margin-bottom: 0px; }
//     </style>
// </head>
// <body>

//     <h1>${resume.name}</h1>
    
//     ${
//       resume.email ||
//       resume.contact?.phone ||
//       resume.contact?.location ||
//       (resume.urls && resume.urls.length)
//         ? `
//     <p class="contact">
//         ${
//           resume.email
//             ? `<a href="mailto:${resume.email}">${resume.email}</a> | `
//             : ""
//         }
//         ${resume.contact?.phone ? resume.contact.phone + " | " : ""}
//         ${resume.contact?.location ? resume.contact.location + " | " : ""}
//         ${
//           resume.urls?.length
//             ? resume.urls
//                 .map(
//                   (link) =>
//                     `<a href="${link.url}" target="_blank">${link.title}</a>`
//                 )
//                 .join(" | ")
//             : ""
//         }
//     </p>`
//         : ""
//     }

//     ${
//       resume.academics?.length
//         ? `
//     <div class="section">
//         <h2>Education</h2>
//         ${resume.academics
//           .map(
//             (edu) => `
//             <div><span class="company">${edu.institute}</span>
//             <span class="date">${formatDate(edu.from)} – ${formatDate(
//               edu.to
//             )}</span></div>
//             <div class="job-title">${edu.degree}</div>
//             ${
//               edu.achievements?.length
//                 ? `<ul><li>Achievements: ${edu.achievements.join(
//                     ", "
//                   )}</li></ul>`
//                 : ""
//             }
//         `
//           )
//           .join("")}
//     </div>`
//         : ""
//     }

//     ${
//       resume.experience?.length
//         ? `
//     <div class="section">
//         <h2>Experience</h2>
//         ${resume.experience
//           .map(
//             (exp) => `
//             <div><span class="company">${exp.organisation}</span>
//             <span class="date">${formatDate(exp.from)} – ${formatDate(
//               exp.to
//             )}</span></div>
//             <div class="job-title">${exp.job_role}</div>
//             ${
//               exp.description?.length
//                 ? `<ul>${exp.description
//                     .map((desc) => `<li>${desc}</li>`)
//                     .join("")}</ul>`
//                 : ""
//             }
//         `
//           )
//           .join("")}
//     </div>`
//         : ""
//     }

//     ${
//       resume.projects?.length
//         ? `
//     <div class="section">
//         <h2>Projects</h2>
//         ${resume.projects
//           .map(
//             (proj) => `
//             <div><span class="company">${proj.title}</span></div>
//             ${
//               proj.description?.length
//                 ? `<ul>${proj.description
//                     .map((desc) => `<li>${desc}</li>`)
//                     .join("")}</ul>`
//                 : ""
//             }
//             <ul>
//                 ${
//                   proj.techstack?.length
//                     ? `<li><b>Tech Stack:</b> ${proj.techstack.join(", ")}</li>`
//                     : ""
//                 }
//                 ${
//                   proj.github
//                     ? `<li><b>GitHub:</b> <a href="${proj.github}" target="_blank">${proj.github}</a></li>`
//                     : ""
//                 }
//             </ul>
//         `
//           )
//           .join("")}
//     </div>`
//         : ""
//     }

//     ${
//       resume.additional_info?.skills?.length ||
//       resume.additional_info?.certifications?.length
//         ? `
//     <div class="section">
//         <h2>Skills & Certifications</h2>
//         <ul>
//             ${
//               resume.additional_info.skills?.length
//                 ? `<li><b>Technical Skills:</b> ${resume.additional_info.skills.join(
//                     ", "
//                   )}</li>`
//                 : ""
//             }
//             ${
//               resume.additional_info.certifications?.length
//                 ? `<li><b>Certifications:</b> ${resume.additional_info.certifications.join(
//                     ", "
//                   )}</li>`
//                 : ""
//             }
//         </ul>
//     </div>`
//         : ""
//     }

// </body>
// </html>
// `;

//     await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: { bottom: "0.25in", left: "0.25in", right: "0.25in" },
//     });

//     await browser.close();

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename="${resume.name}_resume.pdf"`,
//       "Content-Length": pdfBuffer.length,
//     });

//     res.end(pdfBuffer);
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const create_resume = TryCatch(async (req, res, next) => {
  const {
    name,
    email,
    contact,
    summary,
    urls,
    experience,
    academics,
    projects,
    additional_info,
  } = req.body;
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Name and Email are required",
    });
  }
  const resume = await Resume.create({
    name,
    email,
    contact,
    summary,
    urls,
    experience,
    academics,
    projects,
    additional_info,
  });

  await export_resume(resume._id, res)
});
