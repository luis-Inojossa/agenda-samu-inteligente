'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Shield, 
  Smartphone, 
  CheckCircle, 
  Star,
  ArrowRight,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: Calendar,
      title: 'Escala Automática 12x36',
      description: 'Sistema inteligente que organiza automaticamente seus plantões seguindo a escala 12x36 do SAMU.'
    },
    {
      icon: Clock,
      title: 'Gestão de Plantões Extras',
      description: 'Marque facilmente plantões extras em vermelho e mantenha controle total da sua agenda.'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Interface otimizada para celular, perfeita para usar durante os plantões e em qualquer lugar.'
    },
    {
      icon: BarChart3,
      title: 'Estatísticas Detalhadas',
      description: 'Acompanhe quantos plantões normais, extras e dias de folga você tem por mês.'
    },
    {
      icon: Shield,
      title: 'Dados Seguros',
      description: 'Suas informações ficam armazenadas com segurança no seu próprio dispositivo.'
    },
    {
      icon: Zap,
      title: 'Rápido e Simples',
      description: 'Configure sua escala em segundos e tenha acesso imediato à sua agenda completa.'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Carlos Silva',
      role: 'Médico SAMU - SP',
      content: 'Finalmente uma agenda que entende nossa rotina! Não preciso mais calcular manualmente meus plantões.',
      rating: 5
    },
    {
      name: 'Enfermeira Ana Costa',
      role: 'Enfermeira SAMU - RJ',
      content: 'A interface é super intuitiva e o sistema de cores facilita muito a visualização dos plantões.',
      rating: 5
    },
    {
      name: 'Técnico João Santos',
      role: 'Técnico SAMU - MG',
      content: 'Uso no celular durante os plantões. Prático, rápido e sempre funciona offline.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
              <Users className="h-3 w-3 mr-1" />
              Feito especialmente para profissionais do SAMU
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Agenda Inteligente
              <span className="block text-blue-600">para o SAMU</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Gerencie seus plantões 12x36 de forma automática e inteligente. 
              Nunca mais perca o controle da sua escala de trabalho.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                Começar Grátis por 7 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <div className="text-center sm:text-left">
                <div className="text-sm text-gray-500">Depois apenas</div>
                <div className="text-2xl font-bold text-green-600">R$ 19,90/mês</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                7 dias grátis
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Cancele quando quiser
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Sem compromisso
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para organizar seus plantões
            </h2>
            <p className="text-xl text-gray-600">
              Funcionalidades pensadas especificamente para a rotina do SAMU
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={`feature-${index}`} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-gray-600">
              Profissionais do SAMU que já transformaram sua rotina
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={`testimonial-${index}`} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={`star-${index}-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para organizar seus plantões?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Comece agora mesmo com 7 dias grátis. Sem compromisso, cancele quando quiser.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">7</div>
                <div className="text-blue-100">Dias grátis</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">R$ 19,90</div>
                <div className="text-blue-100">Por mês depois</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">∞</div>
                <div className="text-blue-100">Plantões organizados</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
          >
            Começar Meu Período Grátis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-blue-100 text-sm mt-4">
            Não é necessário cartão de crédito para começar
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Agenda SAMU. Feito com ❤️ para os heróis da saúde.
          </p>
        </div>
      </div>
    </div>
  );
}