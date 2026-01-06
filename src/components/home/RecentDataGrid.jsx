import React from "react";
import styled, { keyframes } from "styled-components";
import FileIcons from "../common/FileIcons";

// Get gradient colors based on file type
const getFileColors = (type = "") => {
  if (type.includes("image")) return { gradient: "linear-gradient(135deg, #10b981, #34d399)", shadow: "rgba(16, 185, 129, 0.3)" };
  if (type.includes("pdf")) return { gradient: "linear-gradient(135deg, #ef4444, #f87171)", shadow: "rgba(239, 68, 68, 0.3)" };
  if (type.includes("video")) return { gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", shadow: "rgba(245, 158, 11, 0.3)" };
  if (type.includes("audio")) return { gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)", shadow: "rgba(139, 92, 246, 0.3)" };
  if (type.includes("zip") || type.includes("rar")) return { gradient: "linear-gradient(135deg, #eab308, #facc15)", shadow: "rgba(234, 179, 8, 0.3)" };
  if (type.includes("doc") || type.includes("word")) return { gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)", shadow: "rgba(59, 130, 246, 0.3)" };
  if (type.includes("sheet") || type.includes("excel")) return { gradient: "linear-gradient(135deg, #22c55e, #4ade80)", shadow: "rgba(34, 197, 94, 0.3)" };
  return { gradient: "linear-gradient(135deg, #6b7280, #9ca3af)", shadow: "rgba(107, 114, 128, 0.3)" };
};

// Get human-readable file type
const getFileTypeLabel = (type = "") => {
  if (type.includes("image")) return "Image";
  if (type.includes("pdf")) return "PDF";
  if (type.includes("video")) return "Video";
  if (type.includes("audio")) return "Audio";
  if (type.includes("zip") || type.includes("rar")) return "Archive";
  if (type.includes("doc") || type.includes("word")) return "Document";
  if (type.includes("sheet") || type.includes("excel")) return "Spreadsheet";
  return "File";
};

const RecentDataGrid = ({ files, onFileClick }) => {
  const handleClick = (file) => {
    if (onFileClick) {
      onFileClick(file);
    } else {
      if (!file.data.crypto && !file.data.isEncrypted) {
        window.open(file.data.fileURL, '_blank');
      }
    }
  };

  return (
    <DataGrid>
      {files.slice(0, 8).map((file, index) => {
        const colors = getFileColors(file.data.contentType || file.data.originalType);
        return (
          <DataFile
            key={file.id}
            onClick={() => handleClick(file)}
            style={{ animationDelay: `${index * 0.05}s` }}
            $shadowColor={colors.shadow}
          >
            <IconWrapper $gradient={colors.gradient}>
              <FileIcons type={file.data.contentType || file.data.originalType} />
              {file.data.crypto && <LockBadge>🔐</LockBadge>}
            </IconWrapper>
            <FileInfo>
              <FileName title={file.data.filename}>
                {file.data.filename}
              </FileName>
              <FileType>{getFileTypeLabel(file.data.contentType || file.data.originalType)}</FileType>
            </FileInfo>
          </DataFile>
        );
      })}
    </DataGrid>
  );
};

export default RecentDataGrid;

/* ================= ANIMATIONS ================= */

const fadeInUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(15px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

/* ================= STYLES ================= */

const DataGrid = styled.div`
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
  padding-right: 16px;

  @media screen and (max-width: 768px) {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 12px;
    padding: 8px 4px;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const DataFile = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  animation: ${fadeInUp} 0.4s ease forwards;
  opacity: 0;

  &:hover {
    transform: translateY(-4px);
    border-color: transparent;
    box-shadow: 0 8px 25px ${props => props.$shadowColor || "rgba(0, 0, 0, 0.15)"};
  }

  @media screen and (max-width: 768px) {
    flex: 0 0 180px;
    scroll-snap-align: start;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$gradient};
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  svg {
    font-size: 24px;
    color: white;
  }
`;

const LockBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 14px;
  background: var(--bg-secondary);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileType = styled.div`
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
`;
