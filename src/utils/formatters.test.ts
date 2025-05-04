import { describe, it, expect } from 'vitest';
import { formatFileSize } from './formatters';

describe('Formatter Utils', () => {
  describe('formatFileSize', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });
    
    it('should format bytes correctly', () => {
      expect(formatFileSize(100)).toBe('100 Bytes');
      expect(formatFileSize(999)).toBe('999 Bytes');
    });
    
    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10 KB');
    });
    
    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(2097152)).toBe('2 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });
    
    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });
    
    it('should format terabytes correctly', () => {
      expect(formatFileSize(1099511627776)).toBe('1 TB');
      expect(formatFileSize(2199023255552)).toBe('2 TB');
    });
    
    it('should format decimal values correctly', () => {
      expect(formatFileSize(1500)).toBe('1.5 KB');
      expect(formatFileSize(1600000)).toBe('1.5 MB');
      expect(formatFileSize(2300000000)).toBe('2.1 GB');
    });
  });
}); 