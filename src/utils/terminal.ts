import type { SkillData } from '../types/skill';
import { generateSkillMarkdown, toKebabCase } from './generator';

export function generateInstallCommand(data: SkillData): string {
  const name = toKebabCase(data.name || 'my-skill');
  const markdown = generateSkillMarkdown(data);

  let basePath = '';
  switch (data.scope) {
    case 'workspace':
      basePath = `.agents/skills/${name}`;
      break;
    case 'global':
      basePath = `~/.gemini/config/skills/${name}`;
      break;
    case 'plugin':
      basePath = `~/.gemini/antigravity-cli/plugins/${data.pluginName || 'custom-plugin'}/skills/${name}`;
      break;
  }

  const lines: string[] = [];
  lines.push(`# Create skill directory for "${name}" (${data.scope} scope)`);
  lines.push(`mkdir -p "${basePath}"`);
  lines.push('');
  lines.push(`# Write main SKILL.md`);
  lines.push(`cat << 'EOF' > "${basePath}/SKILL.md"`);
  lines.push(markdown);
  lines.push('EOF');

  // Handle bundle auxiliary files
  if (data.bundleFiles && data.bundleFiles.length > 0) {
    for (const file of data.bundleFiles) {
      const folderPath = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';
      lines.push('');
      if (folderPath) {
        lines.push(`mkdir -p "${basePath}/${folderPath}"`);
      }
      lines.push(`cat << 'EOF' > "${basePath}/${file.path}"`);
      lines.push(file.content);
      lines.push('EOF');
      if (file.folder === 'scripts') {
        lines.push(`chmod +x "${basePath}/${file.path}"`);
      }
    }
  }

  lines.push('');
  lines.push(`# Autonomous discovery active. Or invoke manually:`);
  lines.push(`echo "Skill '${name}' created successfully! Invoke with /${name}"`);

  return lines.join('\n');
}
