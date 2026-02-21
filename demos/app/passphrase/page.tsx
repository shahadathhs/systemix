'use client';

import { cn } from '@/lib/utils';
import {
  calculatePassphraseEntropy,
  generatePassphrase,
} from '@systemix/passphrase';
import {
  Binary,
  Check,
  Copy,
  Hash,
  Info,
  RefreshCw,
  Shield,
  Type,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

export default function PassphrasePage() {
  const [options, setOptions] = useState({
    wordCount: 4,
    separator: ' ',
    useTitleCase: true,
    useUpperCase: false,
    includeNumber: true,
    randomSeparator: false,
  });

  const [passphrase, setPassphrase] = useState('');
  const [copied, setCopied] = useState(false);
  const [entropy, setEntropy] = useState(0);

  const handleGenerate = useCallback(() => {
    try {
      const pass = generatePassphrase(options);
      setPassphrase(pass);
      // Default wordlist is approx 7776 words (eff_large)
      setEntropy(calculatePassphraseEntropy(options.wordCount, 7776));
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : e);
    }
  }, [options]);

  useEffect(() => {
    void handleGenerate();
  }, [handleGenerate]);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(passphrase).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const strength =
    entropy > 80
      ? { label: 'Excellent', color: 'text-emerald-400' }
      : { label: 'Good', color: 'text-blue-400' };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Passphrase Generator
          </h1>
          <p className="text-muted-foreground">
            Create memorable but cryptographically secure passphrases.
          </p>
        </div>

        {/* Display */}
        <div className="glass rounded-2xl p-8 border border-white/10 group relative overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between relative z-10">
            <div className="text-xl sm:text-2xl font-medium text-white break-all tracking-tight leading-relaxed selection:bg-blue-500/30">
              {passphrase}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleGenerate}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all active:scale-95"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 items-center border-t border-white/5 pt-6">
            <div className="flex items-center gap-2">
              <Shield className={cn('w-4 h-4', strength.color)} />
              <span className="text-sm font-medium text-white">
                {strength.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>
                Estimated Entropy:{' '}
                <span className="text-white font-mono">
                  {entropy.toFixed(1)}
                </span>{' '}
                bits
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-lg font-semibold text-white">Core Options</h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Word Count
                  </label>
                  <span className="text-sm font-mono text-blue-400">
                    {options.wordCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={options.wordCount}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      wordCount: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Separator
                </label>
                <div className="flex gap-2">
                  {[' ', '-', '_', '.'].map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setOptions({
                          ...options,
                          separator: s,
                          randomSeparator: false,
                        })
                      }
                      className={cn(
                        'flex-1 py-2 rounded-lg border text-sm transition-all',
                        options.separator === s && !options.randomSeparator
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10',
                      )}
                    >
                      {s === ' ' ? 'Space' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-lg font-semibold text-white">
              Advanced Formatting
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <ToggleCard
                icon={Type}
                title="Title Case"
                description="Capitalizes the first letter of each word."
                active={options.useTitleCase}
                onClick={() =>
                  setOptions({
                    ...options,
                    useTitleCase: !options.useTitleCase,
                    useUpperCase: false,
                  })
                }
              />
              <ToggleCard
                icon={Binary}
                title="Random Numbers"
                description="Injects a random digit into each word."
                active={options.includeNumber}
                onClick={() =>
                  setOptions({
                    ...options,
                    includeNumber: !options.includeNumber,
                  })
                }
              />
              <ToggleCard
                icon={Hash}
                title="Mix Separators"
                description="Uses a random separator between each word pair."
                active={options.randomSeparator}
                onClick={() =>
                  setOptions({
                    ...options,
                    randomSeparator: !options.randomSeparator,
                  })
                }
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ToggleCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border transition-all text-left',
        active
          ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20'
          : 'bg-white/5 border-white/10 hover:bg-white/10',
      )}
    >
      <div
        className={cn(
          'p-2 rounded-lg shrink-0',
          active ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400',
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-gray-400 mt-1">{description}</div>
      </div>
    </button>
  );
}
