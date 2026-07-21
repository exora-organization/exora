const fs = require('fs');
const path = require('path');

const iconMap = {
  Activity: "solar:pulse-bold-duotone",
  AlertTriangle: "solar:danger-triangle-bold-duotone",
  ArrowLeft: "solar:arrow-left-bold-duotone",
  ArrowRight: "solar:arrow-right-bold-duotone",
  BarChart3: "solar:chart-square-bold-duotone",
  BarChart2: "solar:chart-bold-duotone",
  Briefcase: "solar:case-minimalistic-bold-duotone",
  Building: "solar:buildings-bold-duotone",
  Building2: "solar:city-bold-duotone",
  CalendarDays: "solar:calendar-bold-duotone",
  CheckCircle: "solar:check-circle-bold-duotone",
  CheckCircle2: "solar:check-circle-bold-duotone",
  Check: "solar:check-square-bold-duotone",
  ChevronDown: "solar:alt-arrow-down-bold-duotone",
  ChevronRight: "solar:alt-arrow-right-bold-duotone",
  ChevronLeft: "solar:alt-arrow-left-bold-duotone",
  Clock: "solar:clock-circle-bold-duotone",
  Copy: "solar:copy-bold-duotone",
  DollarSign: "solar:dollar-bold-duotone",
  Download: "solar:download-minimalistic-bold-duotone",
  Eye: "solar:eye-bold-duotone",
  EyeOff: "solar:eye-closed-bold-duotone",
  FileBarChart2: "solar:document-text-bold-duotone",
  FileText: "solar:document-text-bold-duotone",
  Filter: "solar:filter-bold-duotone",
  Hash: "solar:hashtag-square-bold-duotone",
  Lightbulb: "solar:lightbulb-bold-duotone",
  Loader2: "solar:refresh-circle-bold-duotone",
  LogIn: "solar:login-2-bold-duotone",
  LogOut: "solar:logout-2-bold-duotone",
  Mail: "solar:letter-bold-duotone",
  MapPin: "solar:map-point-bold-duotone",
  Map: "solar:map-bold-duotone",
  Minus: "solar:minus-circle-bold-duotone",
  Package: "solar:box-bold-duotone",
  RefreshCw: "solar:refresh-bold-duotone",
  Search: "solar:magnifer-bold-duotone",
  Send: "solar:plain-bold-duotone",
  Server: "solar:server-path-bold-duotone",
  ShieldCheck: "solar:shield-check-bold-duotone",
  SlidersHorizontal: "solar:slider-horizontal-bold-duotone",
  Trash2: "solar:trash-bin-trash-bold-duotone",
  TrendingUp: "solar:graph-up-bold-duotone",
  TrendingDown: "solar:graph-down-bold-duotone",
  Users: "solar:users-group-rounded-bold-duotone",
  User: "solar:user-bold-duotone",
  UserX: "solar:user-cross-bold-duotone",
  UserCheck: "solar:user-check-bold-duotone",
  Zap: "solar:bolt-bold-duotone",
  LayoutDashboard: "solar:widget-bold-duotone",
  List: "solar:list-bold-duotone",
  Settings: "solar:settings-bold-duotone",
  PieChart: "solar:pie-chart-2-bold-duotone",
  ShieldAlert: "solar:shield-warning-bold-duotone",
  X: "solar:close-circle-bold-duotone",
  MoreVertical: "solar:menu-dots-bold-duotone",
  MoreHorizontal: "solar:menu-dots-bold-duotone"
};

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else {
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const targetDirs = ['app/(owner)', 'app/(admin)'];
let allFiles = [];
targetDirs.forEach(d => {
  allFiles = allFiles.concat(getFiles(path.join(__dirname, d)));
});

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('lucide-react')) {
    // 1. Find the lucide-react import and extract imported icons
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];?/g;
    
    let match = importRegex.exec(content);
    if (match) {
      const iconList = match[1].split(',').map(s => s.trim()).filter(s => s);
      
      // Replace import with Iconify import
      // Only do this if it's not already importing Icon from @iconify/react
      if (!content.includes('import { Icon } from "@iconify/react"')) {
         content = content.replace(match[0], 'import { Icon } from "@iconify/react";');
      } else {
         content = content.replace(match[0], ''); // Remove lucide-react import
      }
      
      // 2. Replace all occurrences of <IconName ... >
      iconList.forEach(iconName => {
        const mappedName = iconMap[iconName] || "solar:box-bold-duotone"; // Default if missing
        const tagRegex = new RegExp(`<${iconName}\\b`, 'g');
        content = content.replace(tagRegex, `<Icon icon="${mappedName}"`);
      });
      
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});

console.log("Done");
