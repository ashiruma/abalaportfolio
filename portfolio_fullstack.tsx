import React, { useState } from 'react';
import { FileText, Folder, Database, Server, Code } from 'lucide-react';

const FileTree = () => {
  const [expanded, setExpanded] = useState({
    frontend: true,
    backend: true,
    database: false
  });

  const toggle = (key) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const projectStructure = {
    frontend: {
      name: 'Frontend',
      files: [
        'index.html',
        'css/styles.css',
        'js/main.js',
        'js/api.js',
        'js/auth.js',
        'js/gallery.js',
        'js/lightbox.js',
        'login.html'
      ]
    },
    backend: {
      name: 'Backend (Node.js + Express)',
      files: [
        'server.js',
        'config/db.js',
        'routes/portfolio.js',
        'routes/auth.js',
        'middleware/auth.js',
        'models/Image.js',
        'controllers/portfolioController.js',
        'package.json',
        '.env'
      ]
    },
    database: {
      name: 'Database',
      files: [
        'schema.sql',
        'migrations/'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Full-Stack Portfolio Project</h1>
            <p className="text-green-100 text-lg">Complete backend integration with clean architecture</p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <Code className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">Frontend</h3>
                <p className="text-sm text-gray-600">HTML, CSS, Vanilla JS with modular structure</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <Server className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">Backend API</h3>
                <p className="text-sm text-gray-600">Node.js + Express with RESTful endpoints</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                <Database className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">Database</h3>
                <p className="text-sm text-gray-600">MySQL with normalized schema</p>
              </div>
            </div>

            <div className="space-y-6">
              {Object.keys(projectStructure).map((key) => {
                const section = projectStructure[key];
                const icons = {
                  frontend: <Code className="w-5 h-5" />,
                  backend: <Server className="w-5 h-5" />,
                  database: <Database className="w-5 h-5" />
                };
                
                return (
                  <div key={key} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-700">{icons[key]}</div>
                        <span className="font-semibold text-lg">{section.name}</span>
                        <span className="text-sm text-gray-500">({section.files.length} files)</span>
                      </div>
                      <span className="text-2xl text-gray-400">
                        {expanded[key] ? '−' : '+'}
                      </span>
                    </button>
                    
                    {expanded[key] && (
                      <div className="p-4 bg-white">
                        <div className="space-y-2">
                          {section.files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
                              {file.endsWith('/') ? (
                                <Folder className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-600" />
                              )}
                              <span className="text-sm font-mono text-gray-700">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Key Features Implemented
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Authentication:</strong> Login page with JWT-based auth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>RESTful API:</strong> Full CRUD operations for portfolio images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Database Persistence:</strong> MySQL with proper schema and relationships</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Loading States:</strong> Visual feedback during API operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Form Validation:</strong> Client and server-side validation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Same UI/UX:</strong> All original styling and animations preserved</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Scroll down to see all the code files for implementation →</p>
        </div>
      </div>
    </div>
  );
};

export default FileTree;