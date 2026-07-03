export interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    photo: string | null;
  };
  objective: string;
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
    cgpa: string;
    achievements: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
    achievements: string;
  }[];
  projects: {
    name: string;
    tech: string;
    description: string;
    link: string;
  }[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
    tools: string[];
  };
  certifications: {
    name: string;
    issuer: string;
    year: string;
  }[];
  achievements: string;
  extra_curricular: string;
}

export function modernTemplate(data: ResumeData): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:794px;
    margin:0 auto;background:white;color:#1a1340;
    display:flex;min-height:1123px;">

    <!-- Left column -->
    <div style="width:30%;background:#534AB7;
      color:white;padding:24px 16px;">

      <!-- Photo -->
      ${data.personal.photo ? `
      <div style="text-align:center;margin-bottom:20px;">
        <img src="${data.personal.photo}"
          style="width:90px;height:90px;border-radius:50%;
          object-fit:cover;border:3px solid rgba(255,255,255,0.3);">
      </div>` : ''}

      <!-- Contact -->
      <div style="margin-bottom:20px;">
        <h2 style="font-size:11px;letter-spacing:0.1em;
          text-transform:uppercase;color:rgba(255,255,255,0.6);
          margin:0 0 10px;">Contact</h2>
        ${data.personal.email ?
          `<p style="font-size:9px;margin:4px 0;
          word-break:break-all;">📧 ${data.personal.email}</p>` : ''}
        ${data.personal.phone ?
          `<p style="font-size:9px;margin:4px 0;">
          📱 ${data.personal.phone}</p>` : ''}
        ${data.personal.location ?
          `<p style="font-size:9px;margin:4px 0;">
          📍 ${data.personal.location}</p>` : ''}
        ${data.personal.linkedin ?
          `<p style="font-size:9px;margin:4px 0;
          word-break:break-all;">🔗 ${data.personal.linkedin}</p>` : ''}
        ${data.personal.github ?
          `<p style="font-size:9px;margin:4px 0;">
          💻 ${data.personal.github}</p>` : ''}
      </div>

      <!-- Skills -->
      ${data.skills.technical.length > 0 ? `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:11px;letter-spacing:0.1em;
          text-transform:uppercase;color:rgba(255,255,255,0.6);
          margin:0 0 10px;">Technical skills</h2>
        ${data.skills.technical.map(s => `
          <div style="margin-bottom:6px;">
            <span style="font-size:9px;">${s}</span>
            <div style="height:3px;background:rgba(255,255,255,0.2);
              border-radius:2px;margin-top:2px;">
              <div style="height:3px;width:80%;
                background:rgba(255,255,255,0.8);border-radius:2px;">
              </div>
            </div>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- Languages -->
      ${data.skills.languages.length > 0 ? `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:11px;letter-spacing:0.1em;
          text-transform:uppercase;color:rgba(255,255,255,0.6);
          margin:0 0 10px;">Languages</h2>
        ${data.skills.languages.map(l => `
          <p style="font-size:9px;margin:3px 0;">• ${l}</p>
        `).join('')}
      </div>` : ''}

      <!-- Certifications -->
      ${data.certifications?.[0]?.name ? `
      <div>
        <h2 style="font-size:11px;letter-spacing:0.1em;
          text-transform:uppercase;color:rgba(255,255,255,0.6);
          margin:0 0 10px;">Certifications</h2>
        ${data.certifications.map(c => `
          <p style="font-size:9px;margin:3px 0;">
            • ${c.name}${c.issuer ? ` — ${c.issuer}` : ''}
            ${c.year ? `(${c.year})` : ''}
          </p>
        `).join('')}
      </div>` : ''}
    </div>

    <!-- Right column -->
    <div style="width:70%;padding:24px 20px;">

      <!-- Name heading -->
      <div style="border-bottom:3px solid #534AB7;
        padding-bottom:12px;margin-bottom:16px;">
        <h1 style="font-size:22px;font-weight:700;
          color:#534AB7;margin:0 0 2px;">
          ${data.personal.fullName || 'Your Name'}
        </h1>
        <p style="font-size:11px;color:#666;margin:0;">
          ${data.education?.[0]?.degree || ''}
          ${data.education?.[0]?.field
            ? ` in ${data.education[0].field}` : ''}
        </p>
      </div>

      <!-- Objective -->
      ${data.objective ? `
      <div style="margin-bottom:16px;">
        <h2 style="font-size:11px;font-weight:700;
          color:#534AB7;letter-spacing:0.08em;
          text-transform:uppercase;margin:0 0 6px;
          padding-bottom:3px;border-bottom:1px solid #e5e7eb;">
          Objective
        </h2>
        <p style="font-size:9px;line-height:1.5;
          color:#374151;margin:0;">
          ${data.objective}
        </p>
      </div>` : ''}

      <!-- Education -->
      ${data.education?.length > 0 ? `
      <div style="margin-bottom:16px;">
        <h2 style="font-size:11px;font-weight:700;
          color:#534AB7;letter-spacing:0.08em;
          text-transform:uppercase;margin:0 0 8px;
          padding-bottom:3px;border-bottom:1px solid #e5e7eb;">
          Education
        </h2>
        ${data.education.map(edu => `
          <div style="margin-bottom:8px;">
            <div style="display:flex;
              justify-content:space-between;
              align-items:baseline;">
              <strong style="font-size:10px;color:#1a1340;">
                ${edu.institution}
              </strong>
              <span style="font-size:9px;color:#6b7280;">
                ${edu.year}
              </span>
            </div>
            <p style="font-size:9px;color:#374151;margin:2px 0;">
              ${edu.degree}${edu.field ? ` in ${edu.field}` : ''}
              ${edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ''}
            </p>
            ${edu.achievements ? `
            <p style="font-size:9px;color:#6b7280;margin:2px 0;">
              ${edu.achievements}
            </p>` : ''}
          </div>
        `).join('')}
      </div>` : ''}

      <!-- Experience -->
      ${data.experience?.filter(e => e.company).length > 0 ? `
      <div style="margin-bottom:16px;">
        <h2 style="font-size:11px;font-weight:700;
          color:#534AB7;letter-spacing:0.08em;
          text-transform:uppercase;margin:0 0 8px;
          padding-bottom:3px;border-bottom:1px solid #e5e7eb;">
          Experience
        </h2>
        ${data.experience.filter(e => e.company).map(exp => `
          <div style="margin-bottom:10px;">
            <div style="display:flex;
              justify-content:space-between;
              align-items:baseline;">
              <strong style="font-size:10px;color:#1a1340;">
                ${exp.role} — ${exp.company}
              </strong>
              <span style="font-size:9px;color:#6b7280;">
                ${exp.duration}
              </span>
            </div>
            <p style="font-size:9px;color:#374151;
              margin:3px 0;line-height:1.5;">
              ${exp.description}
            </p>
            ${exp.achievements ? `
            <p style="font-size:9px;color:#374151;
              margin:2px 0;font-weight:500;">
              ✓ ${exp.achievements}
            </p>` : ''}
          </div>
        `).join('')}
      </div>` : ''}

      <!-- Projects -->
      ${data.projects?.filter(p => p.name).length > 0 ? `
      <div style="margin-bottom:16px;">
        <h2 style="font-size:11px;font-weight:700;
          color:#534AB7;letter-spacing:0.08em;
          text-transform:uppercase;margin:0 0 8px;
          padding-bottom:3px;border-bottom:1px solid #e5e7eb;">
          Projects
        </h2>
        ${data.projects.filter(p => p.name).map(proj => `
          <div style="margin-bottom:8px;">
            <div style="display:flex;
              justify-content:space-between;
              align-items:baseline;">
              <strong style="font-size:10px;color:#1a1340;">
                ${proj.name}
              </strong>
              ${proj.link ? `
              <a href="${proj.link}"
                style="font-size:9px;color:#534AB7;">
                View →
              </a>` : ''}
            </div>
            ${proj.tech ? `
            <p style="font-size:9px;color:#534AB7;
              font-style:italic;margin:2px 0;">
              ${proj.tech}
            </p>` : ''}
            <p style="font-size:9px;color:#374151;
              margin:2px 0;line-height:1.5;">
              ${proj.description}
            </p>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- Soft skills + Tools -->
      ${(data.skills.soft?.length > 0 ||
         data.skills.tools?.length > 0) ? `
      <div style="margin-bottom:16px;">
        <h2 style="font-size:11px;font-weight:700;
          color:#534AB7;letter-spacing:0.08em;
          text-transform:uppercase;margin:0 0 8px;
          padding-bottom:3px;border-bottom:1px solid #e5e7eb;">
          Skills & Tools
        </h2>
        ${data.skills.soft?.length > 0 ? `
        <p style="font-size:9px;color:#374151;margin:3px 0;">
          <strong>Soft skills:</strong>
          ${data.skills.soft.join(' • ')}
        </p>` : ''}
        ${data.skills.tools?.length > 0 ? `
        <p style="font-size:9px;color:#374151;margin:3px 0;">
          <strong>Tools:</strong>
          ${data.skills.tools.join(' • ')}
        </p>` : ''}
      </div>` : ''}

      <!-- Achievements -->
      ${data.achievements ? `
      <div>
        <h2 style="font-size:11px;font-weight:700;
          color:#534AB7;letter-spacing:0.08em;
          text-transform:uppercase;margin:0 0 6px;
          padding-bottom:3px;border-bottom:1px solid #e5e7eb;">
          Achievements
        </h2>
        <p style="font-size:9px;line-height:1.5;
          color:#374151;margin:0;">
          ${data.achievements}
        </p>
      </div>` : ''}
    </div>
  </div>`;
}

export function classicTemplate(data: ResumeData): string {
  function sectionBlock(title: string, content: string) {
    return `
    <div style="margin-bottom:14px;">
      <h2 style="font-size:11px;font-weight:700;
        letter-spacing:0.08em;border-bottom:1px solid #000;
        padding-bottom:3px;margin:0 0 8px;">
        ${title}
      </h2>
      ${content}
    </div>`;
  }

  return `
  <div style="font-family:'Times New Roman',serif;
    max-width:794px;margin:0 auto;background:white;
    color:#000;padding:32px 40px;min-height:1123px;">

    <!-- Header -->
    <div style="text-align:center;
      border-bottom:2px solid #000;
      padding-bottom:12px;margin-bottom:16px;">
      <h1 style="font-size:20px;font-weight:700;
        letter-spacing:0.05em;margin:0 0 4px;">
        ${(data.personal.fullName || 'YOUR NAME').toUpperCase()}
      </h1>
      <p style="font-size:9px;color:#444;margin:0;">
        ${[data.personal.email, data.personal.phone,
          data.personal.location, data.personal.linkedin]
          .filter(Boolean).join(' | ')}
      </p>
    </div>

    <!-- All sections in single column -->
    ${data.objective ? sectionBlock('OBJECTIVE', `
      <p style="font-size:10px;line-height:1.6;margin:0;">
        ${data.objective}
      </p>
    `) : ''}

    ${data.education && data.education.length > 0 ? sectionBlock('EDUCATION',
      data.education.map(edu => `
        <div style="display:flex;
          justify-content:space-between;margin-bottom:6px;">
          <div>
            <strong style="font-size:10px;">
              ${edu.institution}
            </strong>
            <p style="font-size:9px;margin:1px 0;">
              ${edu.degree}
              ${edu.field ? `in ${edu.field}` : ''}
              ${edu.cgpa ? `| ${edu.cgpa} CGPA` : ''}
            </p>
          </div>
          <span style="font-size:9px;white-space:nowrap;">
            ${edu.year}
          </span>
        </div>
      `).join('')
    ) : ''}

    ${data.experience?.filter(e => e.company).length > 0
      ? sectionBlock('EXPERIENCE',
        data.experience.filter(e => e.company).map(exp => `
          <div style="margin-bottom:8px;">
            <div style="display:flex;
              justify-content:space-between;">
              <strong style="font-size:10px;">
                ${exp.role}, ${exp.company}
              </strong>
              <span style="font-size:9px;">
                ${exp.duration}
              </span>
            </div>
            <p style="font-size:9px;margin:3px 0 0;
              line-height:1.5;">
              ${exp.description}
              ${exp.achievements
                ? `<br>• ${exp.achievements}` : ''}
            </p>
          </div>
        `).join('')
      ) : ''}

    ${data.projects?.filter(p => p.name).length > 0
      ? sectionBlock('PROJECTS',
        data.projects.filter(p => p.name).map(proj => `
          <div style="margin-bottom:6px;">
            <strong style="font-size:10px;">
              ${proj.name}
            </strong>
            ${proj.tech ? `
            <em style="font-size:9px;color:#555;">
              (${proj.tech})
            </em>` : ''}
            <p style="font-size:9px;margin:2px 0;
              line-height:1.5;">
              ${proj.description}
            </p>
          </div>
        `).join('')
      ) : ''}

    ${data.skills.technical?.length > 0
      ? sectionBlock('SKILLS',
        `<p style="font-size:10px;line-height:1.6;margin:0;">
          <strong>Technical:</strong>
          ${data.skills.technical.join(', ')}<br>
          ${data.skills.soft?.length > 0
            ? `<strong>Soft skills:</strong>
              ${data.skills.soft.join(', ')}<br>` : ''}
          ${data.skills.tools?.length > 0
            ? `<strong>Tools:</strong>
              ${data.skills.tools.join(', ')}` : ''}
        </p>`
      ) : ''}

    ${data.achievements
      ? sectionBlock('ACHIEVEMENTS',
        `<p style="font-size:10px;line-height:1.6;margin:0;">
          ${data.achievements}
        </p>`
      ) : ''}
  </div>`;
}

export function minimalTemplate(data: ResumeData): string {
  function sectionBlock(title: string, content: string) {
    return `
    <div style="margin-bottom:16px;">
      <h2 style="font-size:12px;font-weight:bold;
        letter-spacing:0.05em;border-bottom:1px solid #e5e7eb;
        padding-bottom:4px;margin:0 0 10px;">
        ${title}
      </h2>
      ${content}
    </div>`;
  }

  return `
  <div style="font-family:Arial,sans-serif;
    max-width:794px;margin:0 auto;background:white;
    color:#333;padding:40px 48px;min-height:1123px;
    line-height:1.6;">

    <!-- Header -->
    <div style="text-align:left;
      margin-bottom:24px;">
      <h1 style="font-size:24px;font-weight:bold;
        margin:0 0 6px;color:#111;">
        ${data.personal.fullName || 'Your Name'}
      </h1>
      <p style="font-size:10px;color:#555;margin:0;">
        ${[data.personal.email, data.personal.phone,
          data.personal.location, data.personal.linkedin, data.personal.github]
          .filter(Boolean).join(' • ')}
      </p>
    </div>

    <!-- All sections in single column -->
    ${data.objective ? sectionBlock('OBJECTIVE', `
      <p style="font-size:10px;margin:0;">
        ${data.objective}
      </p>
    `) : ''}

    ${data.experience?.filter(e => e.company).length > 0
      ? sectionBlock('EXPERIENCE',
        data.experience.filter(e => e.company).map(exp => `
          <div style="margin-bottom:12px;">
            <div style="display:flex;
              justify-content:space-between;">
              <strong style="font-size:10px;color:#111;">
                ${exp.role}
              </strong>
              <span style="font-size:10px;color:#666;">
                ${exp.duration}
              </span>
            </div>
            <div style="font-size:10px;color:#444;margin-bottom:4px;">
              ${exp.company}
            </div>
            <p style="font-size:10px;margin:0 0 4px 0;">
              ${exp.description}
            </p>
            ${exp.achievements
              ? `<p style="font-size:10px;margin:0;">✓ ${exp.achievements}</p>` : ''}
          </div>
        `).join('')
      ) : ''}

    ${data.education && data.education.length > 0 ? sectionBlock('EDUCATION',
      data.education.map(edu => `
        <div style="display:flex;
          justify-content:space-between;margin-bottom:8px;">
          <div>
            <strong style="font-size:10px;color:#111;">
              ${edu.institution}
            </strong>
            <p style="font-size:10px;margin:2px 0 0 0;">
              ${edu.degree}
              ${edu.field ? `in ${edu.field}` : ''}
              ${edu.cgpa ? `(CGPA: ${edu.cgpa})` : ''}
            </p>
          </div>
          <span style="font-size:10px;color:#666;">
            ${edu.year}
          </span>
        </div>
      `).join('')
    ) : ''}

    ${data.projects?.filter(p => p.name).length > 0
      ? sectionBlock('PROJECTS',
        data.projects.filter(p => p.name).map(proj => `
          <div style="margin-bottom:10px;">
            <div style="display:flex;align-items:baseline;gap:6px;">
              <strong style="font-size:10px;color:#111;">
                ${proj.name}
              </strong>
              ${proj.tech ? `
              <span style="font-size:9px;color:#666;">
                | ${proj.tech}
              </span>` : ''}
            </div>
            <p style="font-size:10px;margin:4px 0 0 0;">
              ${proj.description}
            </p>
          </div>
        `).join('')
      ) : ''}

    ${data.skills.technical?.length > 0
      ? sectionBlock('SKILLS',
        `<div style="font-size:10px;margin:0;">
          <div style="margin-bottom:4px;">
            <strong style="color:#111;">Technical:</strong> ${data.skills.technical.join(', ')}
          </div>
          ${data.skills.soft?.length > 0
            ? `<div style="margin-bottom:4px;">
                <strong style="color:#111;">Soft Skills:</strong> ${data.skills.soft.join(', ')}
              </div>` : ''}
          ${data.skills.tools?.length > 0
            ? `<div>
                <strong style="color:#111;">Tools:</strong> ${data.skills.tools.join(', ')}
              </div>` : ''}
        </div>`
      ) : ''}
      
    ${data.certifications?.filter(c => c.name).length > 0
      ? sectionBlock('CERTIFICATIONS',
        data.certifications.filter(c => c.name).map(c => `
          <div style="font-size:10px;margin-bottom:4px;">
            <strong style="color:#111;">${c.name}</strong>
            ${c.issuer ? `— ${c.issuer}` : ''} ${c.year ? `(${c.year})` : ''}
          </div>
        `).join('')
      ) : ''}
  </div>`;
}
