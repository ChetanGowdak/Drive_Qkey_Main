import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

const PasswordModal = ({ title = "Enter password", onSubmit, onCancel }) => {
  const [password, setPassword] = useState("");

  return ReactDOM.createPortal(
    <Overlay>
      <Box>
        <h3>{title}</h3>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.target.value)}
        />

        <Actions>
          <button
            type="button"
            className="cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="ok"
            onClick={() => onSubmit(password)}
          >
            OK
          </button>
        </Actions>
      </Box>
    </Overlay>,
    document.body
  );
};

export default PasswordModal;

/* ================= STYLES ================= */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;

  /* 🌙 Dark mode overlay */
  body.dark-mode & {
    background: rgba(0, 0, 0, 0.65);
  }
`;

const Box = styled.div`
  width: 320px;
  background: #ffffff;
  color: #111827;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  body.dark-mode & {
    background: #1f1f1f;
    color: #e5e7eb;
    border-color: #2e2e2e;
  }

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
  }

  input {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #111827;
    outline: none;

    &:focus {
      border-color: #2563eb;
    }

    body.dark-mode & {
      background: #121212;
      border-color: #3a3a3a;
      color: #e5e7eb;
    }
  }
`;

const Actions = styled.div`
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    font-weight: 600;
    transition: 0.2s ease;
  }

  .cancel {
    background: transparent;
    color: #6b7280;

    body.dark-mode & {
      color: #9ca3af;
    }
  }

  .ok {
    background: #1a73e8;
    color: #ffffff;
    border-color: #1a73e8;

    &:hover {
      background: #1558c0;
    }
  }
`;
