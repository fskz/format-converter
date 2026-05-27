import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConvertPage } from '@/pages/ConvertPage';
import { PreviewPage } from '@/pages/PreviewPage';
import { BatchPage } from '@/pages/BatchPage';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('convert');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3">
        <h1 className="text-xl font-bold">{t('app.title')}</h1>
      </header>

      <main className="container max-w-4xl py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="convert">{t('app.tabs.convert')}</TabsTrigger>
            <TabsTrigger value="preview">{t('app.tabs.preview')}</TabsTrigger>
            <TabsTrigger value="batch">{t('app.tabs.batch')}</TabsTrigger>
          </TabsList>

          <TabsContent value="convert">
            <ConvertPage />
          </TabsContent>

          <TabsContent value="preview">
            <PreviewPage />
          </TabsContent>

          <TabsContent value="batch">
            <BatchPage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
