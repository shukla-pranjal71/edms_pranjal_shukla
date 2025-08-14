
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight } from "lucide-react";

// Arabic translations
const translations = {
  en: {
    adminPanel: "Admin Panel",
    overview: "Overview",
    users: "Users",
    roles: "Roles",
    emailTemplates: "Email Templates",
    archivedDocuments: "Archived Documents",
    deletedDocuments: "Deleted Documents",
    logout: "Logout",
    language: "Language",
  },
  ar: {
    adminPanel: "لوحة الإدارة",
    overview: "نظرة عامة",
    users: "المستخدمون",
    roles: "الأدوار",
    emailTemplates: "قوالب البريد الإلكتروني",
    archivedDocuments: "المستندات المؤرشفة",
    deletedDocuments: "المستندات المحذوفة",
    logout: "تسجيل خروج",
    language: "اللغة",
  },
};

const LanguageToggle: React.FC = () => {
  const [isArabic, setIsArabic] = useState(localStorage.getItem("lang") === "ar");

  useEffect(() => {
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = isArabic ? "ar" : "en";
    
    // Dispatch a custom event that other components can listen to
    window.dispatchEvent(new CustomEvent("languageChange", { 
      detail: { lang: isArabic ? "ar" : "en" } 
    }));
  }, [isArabic]);

  const toggleLanguage = () => {
    const next = !isArabic;
    setIsArabic(next);
    localStorage.setItem("lang", next ? "ar" : "en");
    document.documentElement.dir = next ? "rtl" : "ltr";
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      aria-label="تبديل اللغة / Switch Language" 
      onClick={toggleLanguage} 
      className="py-0 mx-[24px] my-[7px] px-0"
    >
      {isArabic ? <ToggleRight /> : <ToggleLeft />}
      <span className={`ml-2 ${isArabic ? 'font-arabic' : ''}`}>
        {isArabic ? "العربية" : "EN"}
      </span>
    </Button>
  );
};

export default LanguageToggle;
