import React from 'react';
import type { CVData } from '../../types';

interface CVPreviewProps {
  data: CVData;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-xl font-bold tracking-tight text-primary-600 dark:text-primary-400 border-b-2 border-primary-500/50 pb-2 mb-4">
        {children}
    </h2>
);

const CVPreview: React.FC<CVPreviewProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 sticky top-8 text-gray-800 dark:text-gray-200">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-200 dark:border-gray-700 pb-6 mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{data.fullName || "Tên Của Bạn"}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-x-2">
          <span>{data.email}</span>
          <span>&bull;</span>
          <span>{data.phoneNumber}</span>
          <span>&bull;</span>
          <span>{data.address}</span>
        </p>
        {data.linkedIn && (
          <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1">
            <a href={`https://${data.linkedIn.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">
              {data.linkedIn.replace(/^https?:\/\//, '')}
            </a>
          </p>
        )}
      </div>

      {/* Professional Summary */}
      <section className="mb-8">
        <SectionTitle>Tóm tắt chuyên môn</SectionTitle>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.professionalSummary}</p>
      </section>
      
      {/* Skills */}
      <section className="mb-8">
        <SectionTitle>Kỹ năng</SectionTitle>
        <div className="flex flex-wrap gap-2">
            {data.skills.filter(s => s).map((skill, index) => (
                <span key={index} className="bg-primary-100 dark:bg-primary-900/70 text-primary-800 dark:text-primary-200 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
            ))}
        </div>
      </section>

      {/* Work Experience */}
      <section className="mb-8">
        <SectionTitle>Kinh nghiệm làm việc</SectionTitle>
        {data.workExperience.map((exp) => (
          <div key={exp.id} className="mb-6 last:mb-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-lg">{exp.jobTitle}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{exp.startDate} - {exp.endDate}</p>
            </div>
            <p className="text-md font-semibold text-gray-700 dark:text-gray-300">{exp.company}</p>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1 whitespace-pre-wrap">
                {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^- /, '').trim()}</li>)}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section>
        <SectionTitle>Học vấn</SectionTitle>
        {data.education.map((edu) => (
          <div key={edu.id} className="mb-4 last:mb-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-bold text-lg">{edu.institution}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{edu.startDate} - {edu.endDate}</p>
            </div>
            <p className="text-md font-semibold text-gray-700 dark:text-gray-300">{edu.degree}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default CVPreview;