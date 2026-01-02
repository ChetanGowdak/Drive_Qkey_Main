import styled from "styled-components";
import { useEffect, useState, useCallback, useMemo } from "react";
import { db, auth } from "../../firebase";
import { doc, deleteDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFilesForUser, postTrashCollection } from "../common/firebaseApi";
import RecentDataGrid from "./RecentDataGrid";
import MainData from "./MainData";
import PageHeader from "../common/PageHeader";
import { toast } from "react-toastify";
import { encryptFile } from "../utils/crypto";
import { uploadToCloudinary } from "../common/cloudinaryApi";
import { v4 as uuidv4 } from "uuid";
import PasswordModal from "../common/PasswordModal";

/* ✅ Data Page Component */
const Data = () => {
  const [files, setFiles] = useState([]);
  const [optionsVisible, setOptionsVisible] = useState(null);

  // 🎯 Drag and Drop states
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // 📊 Sort and Filter states
  const [sortBy, setSortBy] = useState("date"); // date, name, size
  const [filterType, setFilterType] = useState("all"); // all, images, documents, audio, video, other

  /* ✅ Fetch files when user logged in */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const unsubscribeFiles = await getFilesForUser(user.uid, setFiles);
        return () => unsubscribeFiles();
      }
    });

    return () => unsubscribe();
  }, []);

  /* ✅ Delete handler (move to trash first) */
  const handleDelete = async (id, data) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this file?");
      if (confirmed) {
        const docRef = doc(db, "myfiles", id);
        await postTrashCollection(data);
        await deleteDoc(docRef);
        toast.warn("File moved to the trash");
      }
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setOptionsVisible(null);
    }
  };

  /* ✅ Toggle options menu */
  const handleOptionsClick = (id) => {
    setOptionsVisible((prevVisible) => (prevVisible === id ? null : id));
  };

  /* 📊 Get file type category */
  const getFileCategory = (file) => {
    const type = file.data.originalType || file.data.contentType || "";
    if (type.startsWith("image/")) return "images";
    if (type.startsWith("audio/")) return "audio";
    if (type.startsWith("video/")) return "video";
    if (type.includes("pdf") || type.includes("document") || type.includes("text")) return "documents";
    return "other";
  };

  /* 📊 Process files with sort and filter */
  const processedFiles = useMemo(() => {
    let result = [...files];

    // Filter
    if (filterType !== "all") {
      result = result.filter((file) => getFileCategory(file) === filterType);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.data.filename || "").localeCompare(b.data.filename || "");
        case "size":
          return (b.data.size || 0) - (a.data.size || 0);
        case "date":
        default:
          return (b.data.timestamp?.seconds || 0) - (a.data.timestamp?.seconds || 0);
      }
    });

    return result;
  }, [files, sortBy, filterType]);

  /* 🎯 Drag and Drop handlers */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setDroppedFile(droppedFiles[0]);
      setUploadError("");
      setShowPassword(true);
    }
  }, []);

  /* 🔐 Encrypt and upload dropped file */
  const handleEncryptAndUpload = async (password) => {
    if (!password || !droppedFile) {
      toast.warn("Upload cancelled");
      setShowPassword(false);
      setDroppedFile(null);
      return;
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      // 1️⃣ Encrypt
      const { encryptedBlob, meta } = await encryptFile(droppedFile, password);
      if (!encryptedBlob || encryptedBlob.size === 0) {
        throw new Error("Encrypted file is empty");
      }

      // 2️⃣ Upload to Cloudinary
      const publicId = `files/${uuidv4()}_${meta.originalName}.enc`;
      const { url } = await uploadToCloudinary(encryptedBlob, publicId);

      // 3️⃣ Save to Firestore
      await addDoc(collection(db, "myfiles"), {
        userId: user.uid,
        filename: meta.originalName,
        fileURL: url,
        cloudinaryPublicId: publicId,
        size: meta.originalSize,
        originalType: meta.originalType,
        crypto: {
          salt_b64: meta.salt_b64,
          iv_b64: meta.iv_b64,
          wrapped_key_b64: meta.wrapped_key_b64,
          key_wrap_iv_b64: meta.key_wrap_iv_b64,
          iters: meta.iters,
        },
        timestamp: serverTimestamp(),
      });

      toast.success("File uploaded successfully! 🎉");
      setShowPassword(false);
      setDroppedFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DataContainer
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <PageHeader pageTitle={"My Drive"} />

      {/* 🎯 Drop Zone Overlay */}
      {isDragging && (
        <DropZoneOverlay>
          <DropZoneContent>
            <DropIcon>📁</DropIcon>
            <DropText>Drop file to upload</DropText>
            <DropSubtext>File will be encrypted with password</DropSubtext>
          </DropZoneContent>
        </DropZoneOverlay>
      )}

      {/* ✅ Recents Section */}
      {files.length > 0 && <SectionTitle>Recents</SectionTitle>}
      <RecentWrapper>
        <RecentDataGrid files={files} />
      </RecentWrapper>

      {/* 📊 Controls Bar - Sort & Filter */}
      {files.length > 0 && (
        <ControlsBar>
          <FilterGroup>
            <ControlLabel>Filter:</ControlLabel>
            <ControlSelect value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Files</option>
              <option value="images">🖼️ Images</option>
              <option value="documents">📄 Documents</option>
              <option value="audio">🎵 Audio</option>
              <option value="video">🎬 Video</option>
              <option value="other">📦 Other</option>
            </ControlSelect>
          </FilterGroup>
          <FilterGroup>
            <ControlLabel>Sort:</ControlLabel>
            <ControlSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">📅 Date</option>
              <option value="name">🔤 Name</option>
              <option value="size">📊 Size</option>
            </ControlSelect>
          </FilterGroup>
          <FileCountBadge>
            {processedFiles.length} of {files.length} files
          </FileCountBadge>
        </ControlsBar>
      )}

      {/* ✅ Main Data Section (Scrollable Area) */}
      <MainDataWrapper>
        <MainData
          files={processedFiles}
          handleOptionsClick={handleOptionsClick}
          optionsVisible={optionsVisible}
          handleDelete={handleDelete}
        />
      </MainDataWrapper>

      {/* 🔐 Password Modal for Drag & Drop Upload */}
      {showPassword && droppedFile && (
        <PasswordModal
          title="Encrypt & Upload"
          subtitle={`Set password for "${droppedFile.name}"`}
          onSubmit={handleEncryptAndUpload}
          onCancel={() => {
            setShowPassword(false);
            setDroppedFile(null);
            setUploadError("");
          }}
          loading={isUploading}
          error={uploadError}
        />
      )}
    </DataContainer>
  );
};

export default Data;

/* ✅ Layout Styles */
const DataContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 0 0 20px;
  overflow: hidden;
  background: var(--bg);
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  margin-top: 30px;
  margin-bottom: -20px;
  color: var(--text-secondary);

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

/* ✅ Recents container: prevents overflow issues */
const RecentWrapper = styled.div`
  flex-shrink: 0;
  width: 100%;
  overflow: hidden;
  padding-top: 10px;
  margin-bottom: 10px;
`;

/* 📊 Controls Bar */
const ControlsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ControlLabel = styled.span`
  font-size: 13px;
  color: #6b7280;

  body.dark-mode & {
    color: #9ca3af;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const ControlSelect = styled.select`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #1a73e8;
  }

  body.dark-mode & {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;

    &:focus {
      border-color: #8ab4f8;
    }
  }
`;

const FileCountBadge = styled.span`
  margin-left: auto;
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 12px;

  body.dark-mode & {
    background: #374151;
    color: #9ca3af;
  }
`;

/* ✅ MainData scroll container */
const MainDataWrapper = styled.div`
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  background: var(--bg);
  padding-bottom: 40px;
  -webkit-overflow-scrolling: touch;
  max-height: calc(100vh - 230px);
  border-top: 1px solid var(--border);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(120, 120, 120, 0.3);
    border-radius: 3px;
  }

  @media (max-width: 1024px) {
    max-height: calc(100vh - 210px);
  }

  @media (max-width: 768px) {
    max-height: calc(100vh - 190px);
  }

  @media (max-width: 480px) {
    max-height: calc(100vh - 160px);
  }
`;

/* 🎯 Drop Zone Overlay Styles */
const DropZoneOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(26, 115, 232, 0.15);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
  border: 3px dashed #1a73e8;
  border-radius: 12px;
  margin: 10px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  body.dark-mode & {
    background: rgba(138, 180, 248, 0.15);
    border-color: #8ab4f8;
  }
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  body.dark-mode & {
    background: #2d2d2d;
  }
`;

const DropIcon = styled.div`
  font-size: 48px;
  animation: bounce 0.6s ease-in-out infinite alternate;

  @keyframes bounce {
    from { transform: translateY(0); }
    to { transform: translateY(-8px); }
  }
`;

const DropText = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #1a73e8;

  body.dark-mode & {
    color: #8ab4f8;
  }
`;

const DropSubtext = styled.div`
  font-size: 14px;
  color: #5f6368;

  body.dark-mode & {
    color: #9aa0a6;
  }
`;
