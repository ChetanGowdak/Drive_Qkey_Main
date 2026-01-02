import React from "react";
import styled from "styled-components";
import FileIcons from "../common/FileIcons";

// Get color based on file type
const getFileColor = (type = "") => {
  if (type.includes("image")) return { bg: "#e8f5e9", color: "#4caf50", darkBg: "#1b3d1f" };
  if (type.includes("pdf")) return { bg: "#ffebee", color: "#f44336", darkBg: "#3d1f1f" };
  if (type.includes("video")) return { bg: "#fff3e0", color: "#ff9800", darkBg: "#3d2f1f" };
  if (type.includes("audio")) return { bg: "#f3e5f5", color: "#9c27b0", darkBg: "#2f1f3d" };
  if (type.includes("zip") || type.includes("rar")) return { bg: "#fff8e1", color: "#ffc107", darkBg: "#3d3a1f" };
  if (type.includes("doc") || type.includes("word")) return { bg: "#e3f2fd", color: "#2196f3", darkBg: "#1f2d3d" };
  if (type.includes("sheet") || type.includes("excel")) return { bg: "#e8f5e9", color: "#4caf50", darkBg: "#1f3d2f" };
  return { bg: "#f5f5f5", color: "#757575", darkBg: "#2a2a2a" };
};

const RecentDataGrid = ({ files }) => {
  return (
    <DataGrid>
      {files.slice(0, 10).map((file) => {
        const colors = getFileColor(file.data.contentType || file.data.originalType);
        return (
          <DataFile key={file.id}>
            <IconWrapper $bgColor={colors.bg} $darkBg={colors.darkBg}>
              <FileIcons type={file.data.contentType || file.data.originalType} />
            </IconWrapper>
            <FileInfo>
              <FileName title={file.data.filename}>
                {file.data.crypto ? "🔐 " : ""}{file.data.filename}
              </FileName>
              <FileType>{getFileTypeLabel(file.data.contentType || file.data.originalType)}</FileType>
            </FileInfo>
          </DataFile>
        );
      })}
    </DataGrid>
  );
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

export default RecentDataGrid;

// ✅ Styles
const DataGrid = styled.div`
  width: 100%;
  margin-top: 25px;
  margin-bottom: 25px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;

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
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 180px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  body.dark-mode & {
    background: #1f2937;
    border-color: #374151;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
  }

  @media screen and (max-width: 768px) {
    flex: 0 0 160px;
    scroll-snap-align: start;
  }
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$bgColor || "#f5f5f5"};
  flex-shrink: 0;

  svg {
    font-size: 22px;
    color: #5f6368;
  }

  body.dark-mode & {
    background: ${props => props.$darkBg || "#2a2a2a"};
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FileName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  body.dark-mode & {
    color: #e5e7eb;
  }
`;

const FileType = styled.div`
  font-size: 11px;
  color: #6b7280;

  body.dark-mode & {
    color: #9ca3af;
  }
`;

