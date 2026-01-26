import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ShieldCheck, Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EmbeddedPDFViewerProps {
    url: string;
    title?: string;
}

const EmbeddedPDFViewer: React.FC<EmbeddedPDFViewerProps> = ({ url, title }) => {
    const { auth } = useAuth();
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    // Reset on URL change
    useEffect(() => {
        setPageNumber(1);
        setScale(1.0);
        setLoading(true);
        setError(null);
    }, [url]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setLoading(false);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPage => Math.min(Math.max(1, prevPage + offset), numPages));
    };

    const zoom = (delta: number) => {
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2.5));
    };

    // Protection: Disable context menu
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        return false;
    };

    return (
        <div
            className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50 select-none shadow-sm"
            onContextMenu={handleContextMenu}
        >
            {/* Header / Toolbar */}
            <div className="bg-white border-b border-slate-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-slate-800">{title || 'PDF Notes'}</span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Zoom */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                        <button onClick={() => zoom(-0.25)} disabled={scale <= 0.5} className="p-1 hover:bg-white rounded disabled:opacity-50">
                            <ZoomOut className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="text-xs w-8 text-center font-medium text-slate-600">{Math.round(scale * 100)}%</span>
                        <button onClick={() => zoom(0.25)} disabled={scale >= 2.0} className="p-1 hover:bg-white rounded disabled:opacity-50">
                            <ZoomIn className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <span className="text-sm font-medium text-slate-700">
                            {pageNumber} / {numPages || '-'}
                        </span>
                        <button
                            onClick={() => changePage(1)}
                            disabled={pageNumber >= numPages}
                            className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="relative bg-slate-100 min-h-[400px] max-h-[600px] overflow-auto flex justify-center p-4">

                {/* Watermark Overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-[0.03]">
                    <div className="flex flex-wrap h-full w-full">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="w-1/3 h-1/4 flex items-center justify-center transform -rotate-12">
                                <span className="text-black font-bold text-lg whitespace-nowrap">
                                    {auth.user?.email || 'Protected Content'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(err) => {
                        console.error('PDF Load Error:', err);
                        setLoading(false);
                        setError('Failed to load PDF');
                    }}
                    loading={
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-slate-500">Loading document...</span>
                        </div>
                    }
                    error={
                        <div className="flex flex-col items-center justify-center py-12 text-red-500">
                            <ShieldCheck className="w-8 h-8 mb-2" />
                            <span>Failed to load document</span>
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="shadow-lg bg-white"
                        width={containerRef.current ? containerRef.current.offsetWidth * 0.8 : undefined}
                    />
                </Document>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-2 text-center text-xs text-slate-400">
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3 h-3" />
                    Protected Content • Printing & Downloading Disabled
                </div>
            </div>
        </div>
    );
};

export default EmbeddedPDFViewer;
