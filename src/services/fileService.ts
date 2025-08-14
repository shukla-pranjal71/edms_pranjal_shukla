
// Mock File Service implementation for document-related file operations (no backend)

export interface FileData {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

// Simulate async operations with promises
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100));

export class FileService {
  static async uploadFile(file: File, filePath?: string): Promise<string> {
    await simulateDelay();
    
    console.log('Mock uploading file:', file.name, 'Path:', filePath || 'default');
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Generate a mock URL
    const timestamp = Date.now();
    const mockUrl = `https://mock-storage.example.com/files/${timestamp}-${file.name.replace(/\s+/g, '_')}`;
    
    console.log('Mock file uploaded successfully:', mockUrl);
    return mockUrl;
  }

  static async uploadChangeRequestFile(file: File, changeRequestId: string): Promise<string> {
    await simulateDelay();
    
    console.log('Mock uploading change request file:', file.name, 'for request:', changeRequestId);
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Generate a mock URL
    const timestamp = Date.now();
    const mockUrl = `https://mock-storage.example.com/change-requests/${changeRequestId}-${timestamp}-${file.name.replace(/\s+/g, '_')}`;
    
    console.log('Mock change request file uploaded successfully:', mockUrl);
    return mockUrl;
  }

  static async deleteFile(fileUrl: string): Promise<boolean> {
    await simulateDelay();
    
    console.log('Mock deleting file:', fileUrl);
    return true;
  }

  static async deleteChangeRequestFile(fileUrl: string): Promise<boolean> {
    await simulateDelay();
    
    console.log('Mock deleting change request file:', fileUrl);
    return true;
  }

  static getFileNameFromUrl(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  static async downloadFile(url: string, fileName: string): Promise<void> {
    console.log('Mock downloading file:', fileName, 'from URL:', url);
    
    // Create a mock download link
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Mock download initiated');
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static validateFileType(file: File, allowedTypes: string[] = ['.pdf', '.doc', '.docx']): boolean {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension);
  }

  static isImageFile(file: File): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    return imageTypes.includes(file.type);
  }

  static isDocumentFile(file: File): boolean {
    const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    return documentTypes.includes(file.type);
  }

  static validateImageFile(file: File): boolean {
    return this.isImageFile(file);
  }

  static validateDocumentFile(file: File): boolean {
    return this.isDocumentFile(file);
  }
}
