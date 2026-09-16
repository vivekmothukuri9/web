import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../../context/AppProvider';
import { supabase } from '../../supabase';
import { Plus, Mic, Send, Paperclip, Camera, FileUp, X, Square, Image as ImageIcon } from 'lucide-react';
import './Composer.css';

const Composer = () => {
  const { setMessages, activeChat, setActiveChat, messages, fetchChats } = useContext(AppContext);
  const [inputText, setInputText] = useState('');
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null); // { type: 'image'|'file', file: File, url: string, name: string }
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  const uploadToSupabase = async (file, type) => {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `chat_uploads/${fileName}`;

    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('chat-media')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !previewMedia) || isUploading) return;

    setIsUploading(true);
    let currentChatId = activeChat;
    let attachmentUrl = null;

    // 1. If no active chat, create one
    if (!currentChatId) {
      const chatTitle = inputText.trim().substring(0, 30) || "New Chat";
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert([{ title: chatTitle }])
        .select()
        .single();

      if (chatError) {
        alert("Error creating chat");
        setIsUploading(false);
        return;
      }
      currentChatId = newChat.id;
      setActiveChat(currentChatId);
      fetchChats(); // Refresh sidebar
    }

    // 2. Upload attachment if exists
    if (previewMedia && previewMedia.file) {
      attachmentUrl = await uploadToSupabase(previewMedia.file, previewMedia.type);
    }

    // 3. Save User Message to Supabase
    const { data: savedMsg, error: msgError } = await supabase
      .from('messages')
      .insert([{
        chat_id: currentChatId,
        role: 'user',
        content: inputText,
        attachment_url: attachmentUrl,
        attachment_type: previewMedia?.type || null
      }])
      .select()
      .single();

    if (!msgError) {
      const uiMsg = {
        id: savedMsg.id,
        role: 'user',
        content: inputText,
        attachment: attachmentUrl ? { type: previewMedia.type, url: attachmentUrl, name: previewMedia.name } : null
      };
      setMessages([...messages, uiMsg]);
    }

    // Reset UI
    setInputText('');
    setPreviewMedia(null);
    setAttachmentMenuOpen(false);
    setIsUploading(false);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // 4. Generate & Save Mock AI Response
    const loadingId = "loading_" + Date.now();
    setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: '...', isLoading: true }]);

    const aiResponseContent = `I received your ${attachmentUrl ? previewMedia.type : 'message'}. How can I help you further?`;

    const { data: aiMsg, error: aiError } = await supabase
      .from('messages')
      .insert([{
        chat_id: currentChatId,
        role: 'assistant',
        content: aiResponseContent
      }])
      .select()
      .single();

    if (!aiError) {
      setMessages(prev => prev.map(msg =>
        msg.id === loadingId ? { id: aiMsg.id, role: 'assistant', content: aiMsg.content, isLoading: false } : msg
      ));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewMedia({
        type: type,
        file: file,
        url: URL.createObjectURL(file),
        name: file.name
      });
      setAttachmentMenuOpen(false);
    }
  };

  const startCamera = async () => {
    try {
      setCameraActive(true);
      setAttachmentMenuOpen(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Could not access camera");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "camera_capture.png", { type: "image/png" });
      setPreviewMedia({
        type: 'image',
        file: file,
        url: URL.createObjectURL(file),
        name: 'camera_capture.png'
      });

      // Stop camera
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }, 'image/png');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="composer-container">
      {/* Hidden Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, 'file')}
      />
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileChange(e, 'image')}
      />

      {cameraActive && (
        <div className="camera-preview-overlay">
          <div className="camera-box">
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="camera-controls">
              <button className="capture-btn" onClick={capturePhoto}>Capture</button>
              <button className="close-btn" onClick={() => {
                const stream = videoRef.current.srcObject;
                if (stream) stream.getTracks().forEach(track => track.stop());
                setCameraActive(false);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isRecording ? (
        <div className="recording-ui animate-fade-in">
          <div className="recording-indicator">
            <div className="recording-dot animate-pulse"></div>
            <span>Recording Voice...</span>
          </div>
          <div className="recording-actions">
            <button className="icon-btn" onClick={() => setIsRecording(false)}>
              <X size={20} />
            </button>
            <button className="icon-btn stop-btn" onClick={() => {
               const mockFile = new File(["voice_data"], "voice_note.mp3", { type: "audio/mpeg" });
               setPreviewMedia({ type: 'file', file: mockFile, url: '#', name: 'voice_note.mp3' });
               setIsRecording(false);
            }}>
              <Square size={20} className="text-danger" />
            </button>
          </div>
        </div>
      ) : (
        <div className="composer-input-wrapper">
          {previewMedia && (
            <div className="media-preview-bar">
              <div className="preview-item">
                {previewMedia.type === 'image' ? (
                  <img src={previewMedia.url} alt="preview" />
                ) : (
                  <div className="file-icon-preview"><FileUp size={16} /></div>
                )}
                <span className="preview-name">{previewMedia.name}</span>
                <button className="remove-preview" onClick={() => setPreviewMedia(null)}>
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <div className="composer-row">
            <div className="composer-actions-left">
              <div className="attachment-wrapper">
                <button
                  className="composer-icon-btn"
                  onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                >
                  <Plus size={20} />
                </button>

                {attachmentMenuOpen && (
                  <div className="attachment-menu animate-fade-in">
                    <button onClick={() => fileInputRef.current.click()}><FileUp size={16} /> Upload file</button>
                    <button onClick={() => imageInputRef.current.click()}><ImageIcon size={16} /> Add image</button>
                    <button onClick={startCamera}><Camera size={16} /> Camera</button>
                  </div>
                )}
              </div>
            </div>

            <textarea
              ref={textareaRef}
              className="composer-textarea"
              placeholder={isUploading ? "Uploading..." : "Message Grasp AI"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isUploading}
              rows={1}
            />

            <div className="composer-actions-right">
              {(!inputText.trim() && !previewMedia) ? (
                <button className="composer-icon-btn" onClick={() => setIsRecording(true)}>
                  <Mic size={20} />
                </button>
              ) : (
                <button
                  className={`send-btn animate-fade-in ${isUploading ? 'opacity-50' : ''}`}
                  onClick={handleSend}
                  disabled={isUploading}
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="composer-footer">
        <p>Grasp AI can make mistakes. Consider verifying important information.</p>
      </div>
    </div>
  );
};

export default Composer;
