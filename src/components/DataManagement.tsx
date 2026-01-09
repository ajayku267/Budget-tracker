import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { exportImport } from '../utils/exportImport';
import { storage } from '../utils/storage';

export function DataManagement() {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportJSON = () => {
    exportImport.exportAllData();
    setMessage({ type: 'success', text: 'Data exported successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportTransactionsCSV = () => {
    exportImport.exportTransactionsCSV();
    setMessage({ type: 'success', text: 'Transactions exported to CSV!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportGoalsCSV = () => {
    exportImport.exportGoalsCSV();
    setMessage({ type: 'success', text: 'Goals exported to CSV!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExportReport = () => {
    exportImport.exportPDFReport();
    setMessage({ type: 'success', text: 'Report generated successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const success = await exportImport.importFromJSON(file);

    if (success) {
      setMessage({ type: 'success', text: 'Data imported successfully!' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: 'Failed to import data. Please check the file format.' });
    }

    setImporting(false);
    event.target.value = '';
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const success = await exportImport.importTransactionsFromCSV(file);

    if (success) {
      setMessage({ type: 'success', text: 'Transactions imported successfully!' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: 'Failed to import transactions. Please check the CSV format.' });
    }

    setImporting(false);
    event.target.value = '';
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
      storage.clearAllData();
      setMessage({ type: 'success', text: 'All data cleared!' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border animate-in ${
            message.type === 'success'
              ? 'bg-success/10 border-success/20 text-success'
              : 'bg-error/10 border-error/20 text-error'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your financial data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button
            onClick={handleExportJSON}
            className="justify-start gap-2"
            variant="outline"
          >
            <FileJson className="h-4 w-4" />
            Export All Data (JSON)
          </Button>

          <Button
            onClick={handleExportTransactionsCSV}
            className="justify-start gap-2"
            variant="outline"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Transactions (CSV)
          </Button>

          <Button
            onClick={handleExportGoalsCSV}
            className="justify-start gap-2"
            variant="outline"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Goals (CSV)
          </Button>

          <Button
            onClick={handleExportReport}
            className="justify-start gap-2"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            Generate Report (TXT)
          </Button>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Restore your data from backup files
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-json">Import All Data (JSON)</Label>
            <Input
              id="import-json"
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground">
              This will replace all your current data
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-csv">Import Transactions (CSV)</Label>
            <Input
              id="import-csv"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              disabled={importing}
            />
            <p className="text-xs text-muted-foreground">
              Add transactions from a CSV file
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-error/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-error">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect all your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-error/20 bg-error/5">
            <div>
              <h4 className="font-medium text-foreground">Clear All Data</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete all transactions, goals, budgets, and settings
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearData}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
