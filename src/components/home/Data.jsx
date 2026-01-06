import styled, { keyframes } from "styled-components";
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
import CustomDropdown from "../common/CustomDropdown";

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
  const [sortBy, setSortBy] = useState("date");
  const [filterType, setFilterType] = useState("all");

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

  /* ✅ Delete handler */
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

  const handleOptionsClick = (id) => {
    setOptionsVisible((prevVisible) => (prevVisible === id ? null : id));
  };

  const getFileCategory = (file) => {
    const type = file.data.originalType || file.data.contentType || "";
    if (type.startsWith("image/")) return "images";
    if (type.startsWith("audio/")) return "audio";
    if (type.startsWith("video/")) return "video";
    if (type.includes("pdf") || type.includes("document") || type.includes("text")) return "documents";
    return "other";
  };

  const handleRecentFileClick = (file) => {
    if (file.data.crypto || file.data.isEncrypted) {
      toast.info("🔐 Use the Download button in the file list to decrypt and download this file");
    } else {
      window.open(file.data.fileURL, '_blank');
    }
  };

  const processedFiles = useMemo(() => {
    let result = [...files];

    if (filterType !== "all") {
      result = result.filter((file) => getFileCategory(file) === filterType);
    }

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

      const { encryptedBlob, meta } = await encryptFile(droppedFile, password);
      if (!encryptedBlob || encryptedBlob.size === 0) {
        throw new Error("Encrypted file is empty");
      }

      const publicId = `files/${uuidv4()}_${meta.originalName}.enc`;
      const { url } = await uploadToCloudinary(encryptedBlob, publicId);

      await addDoc(collection(db, "myfiles"), {
        userId: user.uid,
        filename: meta.originalName,
        fileURL: url,
        cloudinaryPublicId: publicId,
        size: meta.originalSize,
        originalType: meta.originalType,
        isEncrypted: true,
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
      {files.length > 0 && <SectionTitle>📂 Recent Files</SectionTitle>}
      <RecentWrapper>
        <RecentDataGrid files={files} onFileClick={handleRecentFileClick} />
      </RecentWrapper>

      {/* 📊 Controls Bar - Sort & Filter */}
      {files.length > 0 && (
        <ControlsBar>
          <ControlsLeft>
            <CustomDropdown
              label="Type"
              icon="🏷️"
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: "all", label: "All Files", icon: "📁" },
                { value: "images", label: "Images", icon: "🖼️" },
                { value: "documents", label: "Documents", icon: "📄" },
                { value: "audio", label: "Audio", icon: "🎵" },
                { value: "video", label: "Video", icon: "🎬" },
                { value: "other", label: "Other", icon: "📦" },
              ]}
            />

            <CustomDropdown
              label="Sort"
              icon="↕️"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: "date", label: "Date", icon: "📅" },
                { value: "name", label: "Name", icon: "🔤" },
                { value: "size", label: "Size", icon: "📊" },
              ]}
            />
          </ControlsLeft>

          <FileCountBadge>
            <span className="count">{processedFiles.length}</span>
            <span className="label">of {files.length} files</span>
          </FileCountBadge>
        </ControlsBar>
      )}

      {/* ✅ Main Data Section */}
      <MainDataWrapper>
        <MainData
          files={processedFiles}
          handleOptionsClick={handleOptionsClick}
          optionsVisible={optionsVisible}
          handleDelete={handleDelete}
        />
      </MainDataWrapper>

      {/* 🔐 Password Modal */}
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

/* ================= ANIMATIONS ================= */

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.98); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/* ================= STYLES ================= */

const DataContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 20px 0 20px;
  overflow: hidden;
  background: var(--bg);
  position: relative;
`;

const SectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  margin-top: 20px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 6px;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const RecentWrapper = styled.div`
  flex-shrink: 0;
  width: 100%;
  overflow: hidden;
`;

/* 📊 Premium Controls Bar */
const ControlsBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  gap: 16px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border);
  animation: ${fadeIn} 0.3s ease;
`;

const ControlsLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const FileCountBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 20px;
  border: 1px solid var(--border);

  .count {
    font-size: 15px;
    font-weight: 700;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .label {
    font-size: 12px;
    color: var(--text-muted);
  }
`;

/* ✅ MainData scroll container */
const MainDataWrapper = styled.div`
  width: 100%;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  margin-top: 8px;
  padding-bottom: 20px;
  -webkit-overflow-scrolling: touch;
  max-height: calc(100vh - 320px);
  border-top: 1px solid var(--border);

  @media (max-width: 768px) {
    max-height: calc(100vh - 280px);
  }
`;

/* 🎯 Drop Zone Overlay */
const DropZoneOverlay = styled.div`
  position: absolute;
  inset: 10px;
  background: rgba(14, 165, 233, 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border: 3px dashed var(--primary);
  border-radius: 20px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const DropZoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
`;

const DropIcon = styled.div`
  font-size: 56px;
  animation: ${bounce} 1s ease-in-out infinite;
`;

const DropText = styled.div`
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const DropSubtext = styled.div`
  font-size: 14px;
  color: var(--text-muted);
`;
