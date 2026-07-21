const fs = require('fs');
const files = [
  'app/(export-manager)/ai-advisor/page.tsx',
  'app/(owner)/owner-analytics/page.tsx',
  'app/(owner)/export-feasibility-report/page.tsx'
];

const iconMap = {
  Lightbulb: 'solar:lightbulb-bold-duotone',
  Send: 'solar:plain-bold-duotone',
  Activity: 'solar:pulse-bold-duotone',
  BrainCircuit: 'solar:cpu-bold-duotone',
  Box: 'solar:box-bold-duotone',
  FileText: 'solar:document-text-bold-duotone',
  Download: 'solar:download-square-bold-duotone',
  Terminal: 'solar:code-square-bold-duotone',
  ShieldAlert: 'solar:shield-warning-bold-duotone',
  Cpu: 'solar:cpu-bold-duotone',
  CheckCircle2: 'solar:check-circle-bold-duotone',
  Clock: 'solar:clock-circle-bold-duotone',
  Globe: 'solar:global-bold-duotone',
  Shield: 'solar:shield-check-bold-duotone',
  RefreshCw: 'solar:restart-bold-duotone',
  AlertTriangle: 'solar:danger-triangle-bold-duotone',
  UserCheck: 'solar:user-check-bold-duotone',
  ChevronDown: 'solar:alt-arrow-down-bold-duotone',
  ListFilter: 'solar:filter-bold-duotone',
  Play: 'solar:play-bold-duotone',
  Eye: 'solar:eye-bold-duotone',
  FileDown: 'solar:file-download-bold-duotone',
  Building: 'solar:buildings-bold-duotone',
  FileBarChart: 'solar:chart-square-bold-duotone'
};

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    let modified = false;

    // Check if lucide-react is used
    if (content.includes('lucide-react')) {
      Object.keys(iconMap).forEach(lucideIcon => {
        const regex = new RegExp('<' + lucideIcon + '([^>]*)>', 'g');
        if (regex.test(content)) {
          content = content.replace(regex, '<Icon icon="' + iconMap[lucideIcon] + '"$1 />');
          modified = true;
        }
      });

      if (modified) {
        // Remove lucide-react import
        content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];?/g, '');
        // Ensure @iconify/react is imported
        if (!content.includes('@iconify/react')) {
          content = content.replace(/import\s+(.*)\s+from\s+['"]react['"];?/g, '$&\nimport { Icon } from "@iconify/react";');
        }
        fs.writeFileSync(f, content);
        console.log('Updated icons in ' + f);
      }
    }
  }
});
