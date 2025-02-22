"use client";

import ComponentCli from "@/components/cli-commands";
import CodeBlock, { highlight } from "@/components/code-block";
import CopyButton from "@/components/copy-button";
import OpenInV0 from "@/components/open-in-v0";
import { convertRegistryPaths } from "@/lib/utils";
import { Button } from "@/registry/default/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/default/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/default/ui/tooltip";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Code } from "lucide-react";
import { JSX, useEffect, useState } from "react";
import type { RegistryItem } from "shadcn/registry";

export default function ComponentDetails({ component }: { component: RegistryItem }) {
  const [code, setCode] = useState<string | null>(null);
  const [highlightedCode, setHighlightedCode] = useState<JSX.Element | null>(null);

  useEffect(() => {
    const handleEmptyCode = () => {
      setCode("");
      setHighlightedCode(null);
    };

    const loadCode = async () => {
      try {
        const response = await fetch(`/r/${component.name}.json`);
        if (!response.ok) {
          handleEmptyCode();
          return;
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          handleEmptyCode();
          return;
        }

        const data = await response.json();
        const codeContent = convertRegistryPaths(data.files[0].content) || "";
        setCode(codeContent);

        // Pre-highlight the code
        const highlighted = await highlight(codeContent, "ts");
        setHighlightedCode(highlighted);
      } catch (error) {
        console.error("Failed to load code:", error);
        handleEmptyCode();
      }
    };

    loadCode();
  }, [component.name]);

  return (
    <div className="absolute right-2 top-2 flex gap-2 peer-data-[loading=true]:hidden">
      <OpenInV0 componentSource={`https://originui.com/r/${component.name}.json`} />
      <Dialog>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground/80 transition-none hover:bg-transparent hover:text-foreground disabled:opacity-100 lg:opacity-0 lg:group-focus-within/item:opacity-100 lg:group-hover/item:opacity-100"
                  >
                    <Code size={16} strokeWidth={2} aria-hidden={true} />
                  </Button>
                </DialogTrigger>
              </span>
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1 text-xs text-muted-foreground">
              View code
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-left">Installation</DialogTitle>
            <DialogDescription className="sr-only">
              Use the CLI to add components to your project
            </DialogDescription>
          </DialogHeader>
          <div className="min-w-0 space-y-5">
            <ComponentCli name={component.name} />
            <div className="space-y-4">
              <p className="text-lg font-semibold tracking-tight">Code</p>
              <div className="relative">
                {code === "" ? (
                  <p className="text-sm text-muted-foreground">
                    No code available. If you think this is an error, please{" "}
                    <a
                      href="https://github.com/origin-space/originui/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground underline hover:no-underline"
                    >
                      open an issue
                    </a>
                    .
                  </p>
                ) : (
                  <>
                    <CodeBlock code={code} lang="ts" preHighlighted={highlightedCode} />
                    <CopyButton componentSource={code} />
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
