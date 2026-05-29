export interface Project {
  id: string;
  title: string;
  category: 'Branding' | 'Logo Design' | 'Social Media' | 'Packaging' | 'Poster' | 'POSTER' | 'All';
  description: string;
  imageUrl: string;
  client: string;
  year: string;
  tags: string[];
  specs?: string[];
  beforeImage?: string;
  afterImage?: string;
}

export interface Skill {
  name: string;
  category: 'core' | 'technical';
  percentage: number;
}

export interface Tool {
  name: string;
  iconName: 'Photoshop' | 'Illustrator' | 'AfterEffects' | 'Figma';
  label: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  company: string;
  text: string;
  rating: number;
  avatarUrl: string;
}
