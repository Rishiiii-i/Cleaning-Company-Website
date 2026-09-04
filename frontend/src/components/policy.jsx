import React from 'react';
import { downloadPdf } from '../utils/pdf';
import './policy.css';

export default function PolicyLinks({ isCompact = false }) {
  const handleDownload = (docType) => {
    downloadPdf(docType);
  };

  if (isCompact) {
    return (
      <div className="footer-bottom-policy-row">
        <button
          type="button"
          onClick={() => handleDownload('privacy')}
          className="policy-doc-link"
        >
          Privacy Policy
        </button>
        <span className="policy-dot">•</span>
        <button
          type="button"
          onClick={() => handleDownload('terms')}
          className="policy-doc-link"
        >
          Terms & Conditions
        </button>
      </div>
    );
  }

  return (
    <ul className="footer-policy-list">
      <li>
        <button
          type="button"
          onClick={() => handleDownload('privacy')}
          className="footer-policy-btn"
        >
          <span>Privacy Policy</span>
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => handleDownload('terms')}
          className="footer-policy-btn"
        >
          <span>Terms & Conditions</span>
        </button>
      </li>
    </ul>
  );
}
