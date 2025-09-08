import React, { useState } from 'react';
import type { CVData } from '../types';
import CVForm from '../components/cv/CVForm';
import CVPreview from '../components/cv/CVPreview';

const initialCVData: CVData = {
  fullName: 'Tên Của Bạn',
  email: 'email.cua.ban@example.com',
  phoneNumber: '+84 123 456 789',
  address: 'Thành phố, Tỉnh thành',
  linkedIn: 'linkedin.com/in/hoso-cuaban',
  professionalSummary: 'Tóm tắt ngắn gọn về nền tảng chuyên môn và mục tiêu nghề nghiệp của bạn. Nhấn nút AI để tạo!',
  workExperience: [
    {
      id: 'work1',
      jobTitle: 'Kỹ sư phần mềm',
      company: 'Công ty Giải pháp Công nghệ',
      startDate: '2020-01-01',
      endDate: '2023-12-31',
      description: '- Phát triển và bảo trì các ứng dụng web sử dụng React và Node.js.\n- Hợp tác với các nhóm liên chức năng để xác định và ra mắt các tính năng mới.\n- Sử dụng AI để tạo các gạch đầu dòng ấn tượng hơn.',
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Đại học Bách khoa',
      degree: 'Cử nhân Khoa học Máy tính',
      startDate: '2016-09-01',
      endDate: '2020-05-31',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL'],
};

const CVBuilderPage: React.FC = () => {
  const [cvData, setCvData] = useState<CVData>(initialCVData);

  const addWorkExperience = () => {
    setCvData(prev => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { id: crypto.randomUUID(), jobTitle: '', company: '', startDate: '', endDate: '', description: '' }
      ]
    }));
  };

  const removeWorkExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(item => item.id !== id)
    }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: crypto.randomUUID(), institution: '', degree: '', startDate: '', endDate: '' }
      ]
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(item => item.id !== id)
    }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 tracking-tight">Trình tạo CV AI</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <CVForm 
            cvData={cvData} 
            setCvData={setCvData}
            addWorkExperience={addWorkExperience}
            removeWorkExperience={removeWorkExperience}
            addEducation={addEducation}
            removeEducation={removeEducation}
          />
        </div>
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Xem trước trực tiếp</h2>
          <CVPreview data={cvData} />
        </div>
      </div>
    </div>
  );
};

export default CVBuilderPage;