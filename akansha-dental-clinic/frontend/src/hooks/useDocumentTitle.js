import { useEffect } from 'react';

export default function useDocumentTitle(title, description) {
  useEffect(() => {
    const defaultTitle = 'Akansha Dental Clinic | Leading Dental Implants & Cosmetic Dentistry Bhopal';
    document.title = title ? `${title} | Akansha Dental Clinic & Implant Center` : defaultTitle;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);
}
