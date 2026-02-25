'use client';

import React from 'react';
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Calendar,
  User,
  AlertCircle,
  FileImage,
  File,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTruckDocuments } from '../../[id]/_hooks';
import { TabContentSkeleton } from './TruckDetailSkeleton';
import type { TruckDocumentsProps, DocumentType, TruckDocument } from '../../_types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1_000 * 60 * 60 * 24));
}

const docTypeConfig: Record<
  DocumentType,
  { label: string; color: string; icon: React.ElementType }
> = {
  REGISTRATION: { label: 'Registration', color: 'bg-blue-100 text-blue-700', icon: FileText },
  INSURANCE: { label: 'Insurance', color: 'bg-green-100 text-green-700', icon: Shield },
  INSPECTION: { label: 'Inspection', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  OPERATING_LICENSE: { label: 'License', color: 'bg-purple-100 text-purple-700', icon: FileText },
  SERVICE_RECORD: { label: 'Service', color: 'bg-indigo-100 text-indigo-700', icon: File },
  PHOTO: { label: 'Photo', color: 'bg-pink-100 text-pink-700', icon: FileImage },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-700', icon: File },
};

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <FileImage className="h-5 w-5 text-gray-500" />;
  return <FileText className="h-5 w-5 text-gray-500" />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TruckDocuments({ truckId }: TruckDocumentsProps) {
  const { data: documents, isLoading, error } = useTruckDocuments(truckId);

  if (isLoading) return <TabContentSkeleton rows={4} />;

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600 font-medium">Failed to load documents</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
      </div>
    );
  }

  const docs = documents ?? [];

  // Group by type
  const grouped = docs.reduce<Record<string, TruckDocument[]>>((acc, doc) => {
    const key = doc.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  // Expiring documents
  const expiringDocs = docs.filter((d) => {
    const days = daysUntil(d.expiryDate);
    return days !== null && days >= 0 && days <= 30;
  });
  const expiredDocs = docs.filter((d) => {
    const days = daysUntil(d.expiryDate);
    return days !== null && days < 0;
  });

  return (
    <div className="space-y-6">
      {/* Header with upload action */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {docs.length} document{docs.length !== 1 ? 's' : ''} on file
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
          <Upload className="h-4 w-4 mr-1.5" />
          Upload Document
        </Button>
      </div>

      {/* Alert banners */}
      {expiredDocs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{expiredDocs.length}</span> document{expiredDocs.length > 1 ? 's have' : ' has'} expired.
          </p>
        </div>
      )}
      {expiringDocs.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            <span className="font-semibold">{expiringDocs.length}</span> document{expiringDocs.length > 1 ? 's' : ''} expiring within 30 days.
          </p>
        </div>
      )}

      {/* Documents */}
      {docs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([type, typeDocs]) => {
            const cfg = docTypeConfig[type as DocumentType] ?? docTypeConfig.OTHER;
            return (
              <div key={type}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <cfg.icon className="h-4 w-4" />
                  {cfg.label} ({typeDocs.length})
                </h4>
                <div className="space-y-2">
                  {typeDocs.map((doc) => (
                    <DocumentRow key={doc.id} doc={doc} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DocumentRow({ doc }: { doc: TruckDocument }) {
  const cfg = docTypeConfig[doc.type] ?? docTypeConfig.OTHER;
  const expiryDays = daysUntil(doc.expiryDate);
  const isExpired = expiryDays !== null && expiryDays < 0;
  const isExpiring = expiryDays !== null && expiryDays >= 0 && expiryDays <= 30;

  return (
    <div
      className={`
        bg-white border rounded-lg p-4 shadow-sm flex items-center gap-4 transition-colors
        ${isExpired ? 'border-red-200' : isExpiring ? 'border-yellow-200' : 'border-gray-200'}
      `}
    >
      {/* Icon */}
      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <FileIcon mimeType={doc.mimeType} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
          <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          )}
          {isExpiring && (
            <Badge variant="warning" className="text-xs">
              Expiring
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
          <span>{formatFileSize(doc.fileSize)}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(doc.createdAt)}
          </span>
          {doc.expiryDate && (
            <span className={isExpired ? 'text-red-500' : isExpiring ? 'text-yellow-600' : ''}>
              Expires: {formatDate(doc.expiryDate)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {doc.uploaderName}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download">
          <Download className="h-4 w-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Delete">
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 border-dashed rounded-lg p-12 text-center">
      <div className="h-14 w-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="h-7 w-7" />
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">
        No documents uploaded
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        Upload vehicle registration, insurance certificates, inspection reports and other
        documents to keep your fleet records complete.
      </p>
      <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" size="sm">
        <Upload className="h-4 w-4 mr-1.5" />
        Upload First Document
      </Button>
    </div>
  );
}
