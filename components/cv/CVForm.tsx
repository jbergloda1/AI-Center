import React, { useState, useCallback } from 'react';
import type { CVData } from '../../types';
import { streamCVContent } from '../../services/geminiService';
import { SparklesIcon } from '../icons/SparklesIcon';
import LoadingSpinner from '../shared/LoadingSpinner';

interface CVFormProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
  addWorkExperience: () => void;
  removeWorkExperience: (id: string) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
}

const inputStyles = "w-full p-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition duration-150";

const AIGenerateButton: React.FC<{ onClick: () => void; isLoading: boolean; }> = ({ onClick, isLoading }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="absolute top-0 right-0 mt-2 mr-2 p-1.5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Tạo bằng AI"
    >
        {isLoading ? <LoadingSpinner className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
    </button>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h3 className="text-lg font-semibold border-b border-gray-300 dark:border-gray-600 pb-2 mb-4 text-gray-800 dark:text-gray-200">{title}</h3>
);

const AddItemButton: React.FC<{ onClick: () => void, children: React.ReactNode }> = ({ onClick, children }) => (
    <button type="button" onClick={onClick} className="w-full mt-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/50 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
        {children}
    </button>
);

const RemoveItemButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button type="button" onClick={onClick} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline">
        Xóa
    </button>
);


const CVForm: React.FC<CVFormProps> = ({ cvData, setCvData, addWorkExperience, removeWorkExperience, addEducation, removeEducation }) => {
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCvData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAIStream = useCallback(async (fieldName: keyof CVData, prompt: string) => {
        setLoadingStates(prev => ({ ...prev, [fieldName]: true }));
        setCvData(prev => ({ ...prev, [fieldName]: '' }));
        try {
            await streamCVContent(prompt, (chunk) => {
                setCvData(prev => ({ ...prev, [fieldName]: (prev[fieldName] as string) + chunk }));
            });
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setLoadingStates(prev => ({ ...prev, [fieldName]: false }));
        }
    }, [setCvData]);
    
    const handleAIStreamWork = useCallback(async (index: number, prompt: string) => {
        const fieldName = `work-${index}`;
        setLoadingStates(prev => ({ ...prev, [fieldName]: true }));
        
        const newWorkExperience = [...cvData.workExperience];
        newWorkExperience[index].description = '';
        setCvData(prev => ({...prev, workExperience: newWorkExperience}));

        try {
            await streamCVContent(prompt, (chunk) => {
               setCvData(prev => {
                   const updatedWorkExperience = [...prev.workExperience];
                   if(updatedWorkExperience[index]) {
                     updatedWorkExperience[index].description += chunk;
                   }
                   return {...prev, workExperience: updatedWorkExperience};
               });
            });
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setLoadingStates(prev => ({ ...prev, [fieldName]: false }));
        }
    }, [cvData.workExperience, setCvData]);


    const generateProfessionalSummary = () => {
        const prompt = `Dựa trên các chi tiết CV sau, hãy viết một bản tóm tắt chuyên nghiệp và thuyết phục trong 2-3 câu bằng tiếng Việt.
        Chức danh: ${cvData.workExperience[0]?.jobTitle || 'Chưa có'}
        Số năm kinh nghiệm: ${cvData.workExperience.length > 0 ? new Date().getFullYear() - new Date(cvData.workExperience[0].startDate).getFullYear() : 'Chưa có'} năm
        Kỹ năng chính: ${cvData.skills.join(', ')}
        Tập trung vào việc tạo ấn tượng mạnh cho nhà tuyển dụng.`;
        handleAIStream('professionalSummary', prompt);
    };

    const generateWorkDescription = (index: number) => {
        const workItem = cvData.workExperience[index];
        const prompt = `Viết 3-4 gạch đầu dòng chuyên nghiệp, tập trung vào hành động cho một CV mô tả trách nhiệm và thành tích cho vai trò ${workItem.jobTitle} tại ${workItem.company} bằng tiếng Việt.
        Sử dụng phương pháp STAR (Tình huống, Nhiệm vụ, Hành động, Kết quả).
        Mô tả hiện tại là: "${workItem.description}". Hãy cải thiện nó hoặc tạo ra các điểm mới.
        Đầu ra phải là một danh sách các gạch đầu dòng, mỗi gạch đầu dòng bắt đầu bằng một dấu gạch ngang.`;
        handleAIStreamWork(index, prompt);
    };

  return (
    <form className="space-y-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <section>
        <SectionHeader title="Thông tin cá nhân" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="fullName" value={cvData.fullName} onChange={handleInputChange} placeholder="Họ và tên" className={inputStyles}/>
          <input name="email" value={cvData.email} onChange={handleInputChange} placeholder="Email" className={inputStyles}/>
          <input name="phoneNumber" value={cvData.phoneNumber} onChange={handleInputChange} placeholder="Số điện thoại" className={inputStyles}/>
          <input name="address" value={cvData.address} onChange={handleInputChange} placeholder="Địa chỉ" className={inputStyles}/>
          <input name="linkedIn" value={cvData.linkedIn} onChange={handleInputChange} placeholder="URL hồ sơ LinkedIn" className={`${inputStyles} md:col-span-2`}/>
        </div>
      </section>

      <section>
        <SectionHeader title="Tóm tắt chuyên môn" />
        <div className="relative">
          <textarea
            name="professionalSummary"
            value={cvData.professionalSummary}
            onChange={handleInputChange}
            placeholder="Tóm tắt ngắn gọn về nền tảng chuyên môn và mục tiêu nghề nghiệp của bạn."
            rows={4}
            className={`${inputStyles} pr-10`}
          />
          <AIGenerateButton onClick={generateProfessionalSummary} isLoading={loadingStates['professionalSummary']} />
        </div>
      </section>

      <section>
        <SectionHeader title="Kinh nghiệm làm việc" />
        {cvData.workExperience.map((exp, index) => (
          <div key={exp.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 space-y-3 relative">
             <input value={exp.jobTitle} onChange={(e) => { const newWork = [...cvData.workExperience]; newWork[index].jobTitle = e.target.value; setCvData({...cvData, workExperience: newWork}); }} placeholder="Chức danh" className={inputStyles}/>
             <input value={exp.company} onChange={(e) => { const newWork = [...cvData.workExperience]; newWork[index].company = e.target.value; setCvData({...cvData, workExperience: newWork}); }} placeholder="Công ty" className={inputStyles}/>
            <div className="flex space-x-4">
              <input type="date" value={exp.startDate} onChange={(e) => { const newWork = [...cvData.workExperience]; newWork[index].startDate = e.target.value; setCvData({...cvData, workExperience: newWork}); }} className={inputStyles}/>
              <input type="date" value={exp.endDate} onChange={(e) => { const newWork = [...cvData.workExperience]; newWork[index].endDate = e.target.value; setCvData({...cvData, workExperience: newWork}); }} className={inputStyles}/>
            </div>
            <div className="relative">
                <textarea
                    value={exp.description}
                    onChange={(e) => { const newWork = [...cvData.workExperience]; newWork[index].description = e.target.value; setCvData({...cvData, workExperience: newWork}); }}
                    placeholder="Mô tả trách nhiệm và thành tích"
                    rows={5}
                    className={`${inputStyles} pr-10`}
                />
                <AIGenerateButton onClick={() => generateWorkDescription(index)} isLoading={loadingStates[`work-${index}`]} />
            </div>
            {cvData.workExperience.length > 1 && <RemoveItemButton onClick={() => removeWorkExperience(exp.id)} />}
          </div>
        ))}
        <AddItemButton onClick={addWorkExperience}>+ Thêm kinh nghiệm làm việc</AddItemButton>
      </section>
      
      <section>
        <SectionHeader title="Học vấn" />
        {cvData.education.map((edu, index) => (
          <div key={edu.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 space-y-3">
             <input value={edu.institution} onChange={(e) => { const newEdu = [...cvData.education]; newEdu[index].institution = e.target.value; setCvData({...cvData, education: newEdu}); }} placeholder="Tên trường/Tổ chức" className={inputStyles}/>
             <input value={edu.degree} onChange={(e) => { const newEdu = [...cvData.education]; newEdu[index].degree = e.target.value; setCvData({...cvData, education: newEdu}); }} placeholder="Bằng cấp / Chứng chỉ" className={inputStyles}/>
            <div className="flex space-x-4">
              <input type="date" value={edu.startDate} onChange={(e) => { const newEdu = [...cvData.education]; newEdu[index].startDate = e.target.value; setCvData({...cvData, education: newEdu}); }} className={inputStyles}/>
              <input type="date" value={edu.endDate} onChange={(e) => { const newEdu = [...cvData.education]; newEdu[index].endDate = e.target.value; setCvData({...cvData, education: newEdu}); }} className={inputStyles}/>
            </div>
             {cvData.education.length > 1 && <RemoveItemButton onClick={() => removeEducation(edu.id)} />}
          </div>
        ))}
        <AddItemButton onClick={addEducation}>+ Thêm học vấn</AddItemButton>
      </section>

       <section>
        <SectionHeader title="Kỹ năng" />
         <input
            value={cvData.skills.join(', ')}
            onChange={(e) => setCvData(prev => ({...prev, skills: e.target.value.split(',').map(s => s.trim())}))}
            placeholder="ví dụ: React, TypeScript, Quản lý dự án"
            className={inputStyles}
         />
      </section>
    </form>
  );
};

export default CVForm;