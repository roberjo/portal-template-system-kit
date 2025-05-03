import { 
  Document, 
  DocumentVersion, 
  DocumentAuditEntry,
  DocumentShare,
  DocumentMetadata,
  UserData
} from '../store/types';

/**
 * Generates a set of mock documents for all users in the system
 * @param users List of users to create documents for
 * @param currentUserId Current logged in user ID
 * @returns Array of generated documents
 */
export function generateMockDocuments(users: UserData[], currentUserId: string): Document[] {
  if (!users.length) return [];

  const documentTypes = [
    {
      type: 'application/pdf',
      extension: 'pdf',
      label: 'PDF Document'
    },
    {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
      label: 'Excel Spreadsheet'
    },
    {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
      label: 'Word Document'
    },
    {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      extension: 'pptx',
      label: 'PowerPoint Presentation'
    },
    {
      type: 'image/jpeg',
      extension: 'jpg',
      label: 'JPEG Image'
    },
    {
      type: 'application/zip',
      extension: 'zip',
      label: 'ZIP Archive'
    },
    {
      type: 'text/csv',
      extension: 'csv',
      label: 'CSV File'
    }
  ];

  const categories = ['Finance', 'HR', 'Legal', 'Marketing', 'Operations', 'Sales', 'Technical', 'Other'];
  
  // Generate appropriate tags based on document category
  const generateTags = (category: string): string[] => {
    const tagsByCategory: Record<string, string[]> = {
      'Finance': ['budget', 'invoice', 'receipt', 'tax', 'report', 'quarterly', 'forecast'],
      'HR': ['policy', 'employee', 'handbook', 'review', 'hiring', 'training', 'benefits'],
      'Legal': ['contract', 'agreement', 'nda', 'terms', 'policy', 'compliance', 'regulation'],
      'Marketing': ['campaign', 'design', 'social', 'branding', 'analytics', 'content', 'research'],
      'Operations': ['process', 'procedure', 'workflow', 'analysis', 'optimization', 'standard', 'plan'],
      'Sales': ['proposal', 'customer', 'lead', 'presentation', 'pipeline', 'forecast', 'analysis'],
      'Technical': ['specification', 'architecture', 'code', 'diagram', 'documentation', 'manual', 'api'],
      'Other': ['meeting', 'notes', 'template', 'draft', 'general', 'important', 'archive']
    };
    
    const availableTags = tagsByCategory[category] || tagsByCategory['Other'];
    const numTags = Math.floor(Math.random() * 4) + 1; // 1-4 tags
    
    const selectedTags = [];
    for (let i = 0; i < numTags; i++) {
      const randomIndex = Math.floor(Math.random() * availableTags.length);
      selectedTags.push(availableTags[randomIndex]);
      // Remove the selected tag to avoid duplicates
      if (availableTags.length > 1) {
        availableTags.splice(randomIndex, 1);
      }
    }
    
    return selectedTags;
  };
  
  const mockDocuments: Document[] = [];
  
  // Create documents for each user
  users.forEach(user => {
    // Generate 2-5 random documents for each user
    const numDocs = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numDocs; i++) {
      const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const tags = generateTags(category);
      
      // Generate a realistic file name
      const nameOptions = [
        `${category.toLowerCase()}-${tags[0] || 'document'}-${new Date().getFullYear()}`,
        `${user.name.split(' ')[0].toLowerCase()}-${tags[0] || 'report'}`,
        `${category.toLowerCase()}-${Math.floor(Math.random() * 1000)}`,
        `${tags[0] || 'document'}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
      ];
      
      const baseName = nameOptions[Math.floor(Math.random() * nameOptions.length)];
      const fileName = `${baseName}.${docType.extension}`;
      
      // Random file size between 100KB and 10MB
      const fileSize = Math.floor(Math.random() * 10000000) + 100000;
      
      // Random creation date between last month and now
      const creationDate = new Date(
        Date.now() - Math.floor(Math.random() * 30 * 86400000)
      ).toISOString();
      
      // Random number of versions (1-3)
      const numVersions = Math.floor(Math.random() * 3) + 1;
      const versions: DocumentVersion[] = [];
      
      for (let v = 1; v <= numVersions; v++) {
        // Version dates should be chronologically ordered
        const versionDate = new Date(
          new Date(creationDate).getTime() + (v - 1) * Math.floor(Math.random() * 5 * 86400000)
        ).toISOString();
        
        versions.push({
          id: `v${v}-${Date.now() + i * 100 + v}`,
          versionNumber: v,
          fileUrl: `/mock-files/${baseName}-v${v}.${docType.extension}`,
          createdAt: versionDate,
          createdBy: user.id
        });
      }
      
      // Generate audit log based on versions and random actions
      const auditLog: DocumentAuditEntry[] = [];
      
      // Initial upload entry
      auditLog.push({
        id: `a1-${Date.now() + i * 100}`,
        action: 'upload',
        userId: user.id,
        userName: user.name,
        timestamp: versions[0].createdAt,
        details: 'Initial upload'
      });
      
      // Add entries for subsequent versions
      for (let v = 2; v <= numVersions; v++) {
        auditLog.push({
          id: `a${auditLog.length + 1}-${Date.now() + i * 100 + v}`,
          action: 'upload',
          userId: user.id,
          userName: user.name,
          timestamp: versions[v - 1].createdAt,
          details: `Uploaded new version (v${v})`
        });
      }
      
      // Add some random metadata edits
      if (Math.random() > 0.5) {
        const editDate = new Date(
          new Date(versions[numVersions - 1].createdAt).getTime() + Math.floor(Math.random() * 3 * 86400000)
        ).toISOString();
        
        auditLog.push({
          id: `a${auditLog.length + 1}-${Date.now() + i * 100 + numVersions + 1}`,
          action: 'edit',
          userId: user.id,
          userName: user.name,
          timestamp: editDate,
          details: 'Updated document metadata'
        });
      }
      
      // Randomly add download entries
      if (Math.random() > 0.7) {
        const downloadDate = new Date(
          new Date(versions[numVersions - 1].createdAt).getTime() + Math.floor(Math.random() * 2 * 86400000)
        ).toISOString();
        
        auditLog.push({
          id: `a${auditLog.length + 1}-${Date.now() + i * 100 + numVersions + 2}`,
          action: 'download',
          userId: user.id,
          userName: user.name,
          timestamp: downloadDate,
          details: 'Downloaded document'
        });
      }
      
      // Generate random shares with other users (30% chance)
      const sharedWith: DocumentShare[] = [];
      if (Math.random() > 0.7) {
        // Select 1-2 random users to share with (excluding document owner)
        const otherUsers = users.filter(u => u.id !== user.id);
        const numShares = Math.min(otherUsers.length, Math.floor(Math.random() * 2) + 1);
        
        for (let s = 0; s < numShares; s++) {
          if (otherUsers.length === 0) break;
          
          const randomUserIndex = Math.floor(Math.random() * otherUsers.length);
          const shareUser = otherUsers[randomUserIndex];
          otherUsers.splice(randomUserIndex, 1);
          
          const shareDate = new Date(
            new Date(creationDate).getTime() + Math.floor(Math.random() * 10 * 86400000)
          ).toISOString();
          
          const permissions: ('view' | 'edit' | 'admin')[] = ['view', 'edit', 'admin'];
          const permission = permissions[Math.floor(Math.random() * 2)]; // Mostly view or edit, rarely admin
          
          sharedWith.push({
            id: `share-${Date.now() + i * 100 + s}`,
            userId: shareUser.id,
            userName: shareUser.name,
            permission: permission,
            sharedAt: shareDate
          });
          
          // Add share action to audit log
          auditLog.push({
            id: `a${auditLog.length + 1}-${Date.now() + i * 100 + numVersions + 3 + s}`,
            action: 'share',
            userId: user.id,
            userName: user.name,
            timestamp: shareDate,
            details: `Shared with ${shareUser.name} (${permission} permission)`
          });
        }
      }
      
      // Create the document
      const document: Document = {
        id: `${Date.now() + i}`,
        ownerId: user.id,
        ownerName: user.name,
        fileName: fileName,
        fileSize: fileSize,
        fileType: docType.type,
        metadata: {
          title: baseName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          description: `${docType.label} for ${category} department. ${tags.join(', ')}.`,
          tags: tags,
          category: category,
          customFields: {
            'department': category,
            'status': Math.random() > 0.5 ? 'Final' : 'Draft'
          }
        },
        currentVersion: numVersions,
        versions: versions,
        auditLog: auditLog,
        sharedWith: sharedWith,
        createdAt: creationDate,
        updatedAt: versions[versions.length - 1].createdAt,
        isPublic: Math.random() > 0.9 // 10% chance to be public
      };
      
      mockDocuments.push(document);
    }
  });
  
  return mockDocuments;
} 